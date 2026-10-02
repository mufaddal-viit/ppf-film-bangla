import 'server-only';
import { leadsCollection, type LeadDocument } from '../collections';

export type NewLead = Omit<LeadDocument, '_id' | 'status' | 'createdAt' | 'updatedAt'>;

/** Storage-agnostic contract. A DynamoDB or SQL implementation only needs to satisfy this. */
interface LeadRepository {
  create(lead: NewLead): Promise<{ id: string }>;
}

export const leadRepository: LeadRepository = {
  async create(lead) {
    const now = new Date();
    const result = await (
      await leadsCollection()
    ).insertOne({ ...lead, status: 'new', createdAt: now, updatedAt: now });
    return { id: result.insertedId.toHexString() };
  },
};
