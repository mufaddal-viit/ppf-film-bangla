import 'server-only';
import { ObjectId, type WithId } from 'mongodb';
import { vendorsCollection, type VendorDocument } from '../collections';

export type Vendor = Omit<VendorDocument, '_id'> & { id: string };

export type VendorInput = Pick<Vendor, 'shopName' | 'contactName' | 'email' | 'phone' | 'address' | 'installers'>;

function toVendor({ _id, ...doc }: WithId<VendorDocument>): Vendor {
  return { id: _id.toHexString(), ...doc };
}

/** Installation shops. Their sign-ins live in portal-user.repository.ts. */
export const vendorRepository = {
  async list(): Promise<Vendor[]> {
    const docs = await (await vendorsCollection()).find().sort({ active: -1, shopName: 1 }).toArray();
    return docs.map(toVendor);
  },

  async findById(id: string): Promise<Vendor | null> {
    if (!ObjectId.isValid(id)) return null;
    const doc = await (await vendorsCollection()).findOne({ _id: new ObjectId(id) });
    return doc ? toVendor(doc) : null;
  },

  async create(input: VendorInput): Promise<{ id: string }> {
    const now = new Date();
    const result = await (
      await vendorsCollection()
    ).insertOne({ ...input, email: input.email.toLowerCase(), active: true, createdAt: now, updatedAt: now });
    return { id: result.insertedId.toHexString() };
  },

  /** False when the vendor does not exist. */
  async update(id: string, patch: VendorInput & { active: boolean }): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false;
    const result = await (
      await vendorsCollection()
    ).updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...patch, email: patch.email.toLowerCase(), updatedAt: new Date() } },
    );
    return result.matchedCount === 1;
  },
};
