import 'server-only';
import { randomUUID } from 'node:crypto';
import { ObjectId, type Filter, type WithId } from 'mongodb';
import { LEAD_STATUSES, OPEN_LEAD_STATUSES, type LeadStatus } from '@/lib/admin/constants';
import type { LeadType } from '@/lib/config/schema';
import { leadsCollection, type LeadDocument } from '../collections';

export type NewLead = Omit<LeadDocument, '_id' | 'status' | 'notes' | 'followUpAt' | 'createdAt' | 'updatedAt'>;

export type Lead = Omit<LeadDocument, '_id' | 'notes'> & { id: string; notes: NonNullable<LeadDocument['notes']> };

export type LeadFilter = { status?: LeadStatus; type?: LeadType; q?: string };

type LeadStats = {
  byStatus: Record<LeadStatus, number>;
  last24Hours: number;
  last7Days: number;
  open: number;
  followUpsDue: number;
};

/** Storage-agnostic contract. A DynamoDB or SQL implementation only needs to satisfy this. */
interface LeadRepository {
  create(lead: NewLead): Promise<{ id: string }>;
  list(filter: LeadFilter, page: { skip: number; limit: number }): Promise<{ items: Lead[]; total: number }>;
  findById(id: string): Promise<Lead | null>;
  /** Each returns false when the lead does not exist. */
  setStatus(id: string, status: LeadStatus): Promise<boolean>;
  setFollowUp(id: string, at: Date | null): Promise<boolean>;
  addNote(id: string, note: { text: string; authorName: string }): Promise<boolean>;
  stats(): Promise<LeadStats>;
  followUpsDue(limit: number): Promise<Lead[]>;
}

function toLead({ _id, notes, ...doc }: WithId<LeadDocument>): Lead {
  return { id: _id.toHexString(), notes: notes ?? [], ...doc };
}

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function toQuery({ status, type, q }: LeadFilter): Filter<LeadDocument> {
  const query: Filter<LeadDocument> = {};
  if (status) query.status = status;
  if (type) query.type = type;
  if (q) {
    // Case-insensitive "contains" on the fields staff search by. Fine at this data size; no text index needed.
    const pattern = { $regex: escapeRegex(q), $options: 'i' };
    query.$or = [{ name: pattern }, { phone: pattern }, { email: pattern }];
  }
  return query;
}

/** Applies an update to one lead; false when the id is malformed or not found. */
async function updateOne(id: string, update: Parameters<Awaited<ReturnType<typeof leadsCollection>>['updateOne']>[1]) {
  if (!ObjectId.isValid(id)) return false;
  const result = await (await leadsCollection()).updateOne({ _id: new ObjectId(id) }, update);
  return result.matchedCount === 1;
}

const dueFilter = (): Filter<LeadDocument> => ({
  followUpAt: { $lte: new Date() },
  status: { $in: [...OPEN_LEAD_STATUSES] },
});

export const leadRepository: LeadRepository = {
  async create(lead) {
    const now = new Date();
    const result = await (
      await leadsCollection()
    ).insertOne({ ...lead, status: 'new', createdAt: now, updatedAt: now });
    return { id: result.insertedId.toHexString() };
  },

  async list(filter, { skip, limit }) {
    const collection = await leadsCollection();
    const query = toQuery(filter);
    const [docs, total] = await Promise.all([
      collection.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      collection.countDocuments(query),
    ]);
    return { items: docs.map(toLead), total };
  },

  async findById(id) {
    if (!ObjectId.isValid(id)) return null;
    const doc = await (await leadsCollection()).findOne({ _id: new ObjectId(id) });
    return doc ? toLead(doc) : null;
  },

  setStatus: (id, status) => updateOne(id, { $set: { status, updatedAt: new Date() } }),

  setFollowUp: (id, at) =>
    updateOne(
      id,
      at
        ? { $set: { followUpAt: at, updatedAt: new Date() } }
        : { $unset: { followUpAt: '' }, $set: { updatedAt: new Date() } },
    ),

  addNote: (id, note) =>
    updateOne(id, {
      $push: { notes: { id: randomUUID(), at: new Date(), ...note } },
      $set: { updatedAt: new Date() },
    }),

  async stats() {
    const collection = await leadsCollection();
    const since = (hours: number) => ({ createdAt: { $gte: new Date(Date.now() - hours * 3_600_000) } });
    const [groups, last24Hours, last7Days, followUpsDue] = await Promise.all([
      collection
        .aggregate<{ _id: LeadStatus; count: number }>([{ $group: { _id: '$status', count: { $sum: 1 } } }])
        .toArray(),
      collection.countDocuments(since(24)),
      collection.countDocuments(since(24 * 7)),
      collection.countDocuments(dueFilter()),
    ]);
    const byStatus = Object.fromEntries(LEAD_STATUSES.map((status) => [status, 0])) as Record<LeadStatus, number>;
    for (const group of groups) byStatus[group._id] = group.count;
    const open = OPEN_LEAD_STATUSES.reduce((sum, status) => sum + byStatus[status], 0);
    return { byStatus, last24Hours, last7Days, open, followUpsDue };
  },

  async followUpsDue(limit) {
    const docs = await (await leadsCollection()).find(dueFilter()).sort({ followUpAt: 1 }).limit(limit).toArray();
    return docs.map(toLead);
  },
};
