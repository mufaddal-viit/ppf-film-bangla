import 'server-only';
import { randomUUID } from 'node:crypto';
import { ObjectId, type Filter, type UpdateFilter, type WithId } from 'mongodb';
import { RETARGET_AFTER_DAYS, type CustomerSegment } from '@/lib/admin/constants';
import { customersCollection, type CustomerDocument, type CustomerVehicle } from '../collections';

export type Customer = Omit<CustomerDocument, '_id'> & { id: string };

export type CustomerFilter = { q?: string; segment?: CustomerSegment; tag?: string };

type CustomerDetails = Pick<CustomerDocument, 'name' | 'phone' | 'tags' | 'marketingOptIn'> & { email?: string };

function toCustomer({ _id, ...doc }: WithId<CustomerDocument>): Customer {
  return { id: _id.toHexString(), ...doc };
}

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const retargetCutoff = () => new Date(Date.now() - RETARGET_AFTER_DAYS * 86_400_000);

function toQuery({ q, segment, tag }: CustomerFilter): Filter<CustomerDocument> {
  const query: Filter<CustomerDocument> = {};
  if (segment === 'opted-in' || segment === 'due') query.marketingOptIn = true;
  if (segment === 'due') {
    query.$and = [{ $or: [{ lastContactedAt: { $exists: false } }, { lastContactedAt: { $lt: retargetCutoff() } }] }];
  }
  if (tag) query.tags = tag;
  if (q) {
    const pattern = { $regex: escapeRegex(q), $options: 'i' };
    query.$or = [
      { name: pattern },
      { phone: pattern },
      { email: pattern },
      { 'vehicles.make': pattern },
      { 'vehicles.model': pattern },
      { 'vehicles.plate': pattern },
    ];
  }
  return query;
}

async function updateOne(id: string, update: UpdateFilter<CustomerDocument>): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const result = await (await customersCollection()).updateOne({ _id: new ObjectId(id) }, update);
  return result.matchedCount === 1;
}

const touch = () => ({ updatedAt: new Date() });

export const customerRepository = {
  async list(filter: CustomerFilter, { skip, limit }: { skip: number; limit: number }) {
    const collection = await customersCollection();
    const query = toQuery(filter);
    const [docs, total] = await Promise.all([
      collection.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      collection.countDocuments(query),
    ]);
    return { items: docs.map(toCustomer), total };
  },

  async findById(id: string): Promise<Customer | null> {
    if (!ObjectId.isValid(id)) return null;
    const doc = await (await customersCollection()).findOne({ _id: new ObjectId(id) });
    return doc ? toCustomer(doc) : null;
  },

  async findByPhone(phone: string): Promise<Customer | null> {
    const doc = await (await customersCollection()).findOne({ phone });
    return doc ? toCustomer(doc) : null;
  },

  /** Throws MongoDB's duplicate key error when the phone number is already a customer. */
  async create(input: CustomerDetails & { vehicles?: Array<Omit<CustomerVehicle, 'id'>>; leadId?: string }) {
    const now = new Date();
    const { vehicles = [], ...rest } = input;
    const result = await (
      await customersCollection()
    ).insertOne({
      ...rest,
      vehicles: vehicles.map((vehicle) => ({ id: randomUUID(), ...vehicle })),
      notes: [],
      createdAt: now,
      updatedAt: now,
    });
    return { id: result.insertedId.toHexString() };
  },

  updateDetails: ({ email, ...details }: CustomerDetails, id: string) =>
    updateOne(id, {
      $set: { ...details, ...(email && { email }), ...touch() },
      ...(!email && { $unset: { email: '' } }),
    }),

  addVehicle: (id: string, vehicle: Omit<CustomerVehicle, 'id'>) =>
    updateOne(id, { $push: { vehicles: { id: randomUUID(), ...vehicle } }, $set: touch() }),

  removeVehicle: (id: string, vehicleId: string) =>
    updateOne(id, { $pull: { vehicles: { id: vehicleId } }, $set: touch() }),

  addNote: (id: string, note: { text: string; authorName: string }) =>
    updateOne(id, { $push: { notes: { id: randomUUID(), at: new Date(), ...note } }, $set: touch() }),

  markContacted: (id: string) => updateOne(id, { $set: { lastContactedAt: new Date(), ...touch() } }),

  async stats(): Promise<{ total: number; optedIn: number; due: number }> {
    const collection = await customersCollection();
    const [total, optedIn, due] = await Promise.all([
      collection.countDocuments({}),
      collection.countDocuments(toQuery({ segment: 'opted-in' })),
      collection.countDocuments(toQuery({ segment: 'due' })),
    ]);
    return { total, optedIn, due };
  },

  /** Every tag in use, for the list filter. */
  async tags(): Promise<string[]> {
    return ((await (await customersCollection()).distinct('tags')) as string[]).sort();
  },
};
