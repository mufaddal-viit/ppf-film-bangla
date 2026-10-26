import 'server-only';
import { ObjectId, type Filter, type WithId } from 'mongodb';
import { countersCollection, installationsCollection, type InstallationDocument } from '../collections';

export type Installation = Omit<InstallationDocument, '_id' | 'customerId' | 'vendorId' | 'rollId' | 'productId'> & {
  id: string;
  customerId: string;
  vendorId: string;
  rollId: string;
  productId: string;
};

export type InstallationInput = {
  customerId: string;
  vehicleId: string;
  vendorId: string;
  rollId: string;
  productId: string;
  installer: string;
  area: string;
  metresUsed: number;
  installedAt: Date;
  warrantyExpiresAt: Date;
};

export type InstallationFilter = {
  vendorId?: string;
  customerId?: string;
  q?: string;
};

function toInstallation(doc: WithId<InstallationDocument>): Installation {
  return {
    id: doc._id.toHexString(),
    warrantyNumber: doc.warrantyNumber,
    customerId: doc.customerId.toHexString(),
    vehicleId: doc.vehicleId,
    vendorId: doc.vendorId.toHexString(),
    rollId: doc.rollId.toHexString(),
    productId: doc.productId.toHexString(),
    installer: doc.installer,
    area: doc.area,
    metresUsed: doc.metresUsed,
    installedAt: doc.installedAt,
    warrantyExpiresAt: doc.warrantyExpiresAt,
    voidedAt: doc.voidedAt,
    voidReason: doc.voidReason,
    createdAt: doc.createdAt,
  };
}

/** Generate the next warranty number: PPF-{YYYY}-{00001}. Atomic via findOneAndUpdate on a counter. */
async function nextWarrantyNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const counterId = `warranty-${year}`;
  const counters = await countersCollection();
  const result = await counters.findOneAndUpdate(
    { _id: counterId },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: 'after' },
  );
  const seq = result!.seq;
  return `PPF-${year}-${String(seq).padStart(5, '0')}`;
}

function toQuery({ vendorId, customerId, q }: InstallationFilter): Filter<InstallationDocument> {
  const query: Filter<InstallationDocument> = {};
  if (vendorId && ObjectId.isValid(vendorId)) query.vendorId = new ObjectId(vendorId);
  if (customerId && ObjectId.isValid(customerId)) query.customerId = new ObjectId(customerId);
  if (q) {
    const pattern = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    query.$or = [{ warrantyNumber: pattern }, { installer: pattern }, { area: pattern }];
  }
  return query;
}

export const installationRepository = {
  async create(input: InstallationInput): Promise<{ id: string; warrantyNumber: string }> {
    const warrantyNumber = await nextWarrantyNumber();
    const now = new Date();
    const result = await (
      await installationsCollection()
    ).insertOne({
      warrantyNumber,
      customerId: new ObjectId(input.customerId),
      vehicleId: input.vehicleId,
      vendorId: new ObjectId(input.vendorId),
      rollId: new ObjectId(input.rollId),
      productId: new ObjectId(input.productId),
      installer: input.installer,
      area: input.area,
      metresUsed: input.metresUsed,
      installedAt: input.installedAt,
      warrantyExpiresAt: input.warrantyExpiresAt,
      createdAt: now,
    });
    return { id: result.insertedId.toHexString(), warrantyNumber };
  },

  async findById(id: string): Promise<Installation | null> {
    if (!ObjectId.isValid(id)) return null;
    const doc = await (await installationsCollection()).findOne({ _id: new ObjectId(id) });
    return doc ? toInstallation(doc) : null;
  },

  async findByWarrantyNumber(warrantyNumber: string): Promise<Installation | null> {
    const doc = await (await installationsCollection()).findOne({ warrantyNumber });
    return doc ? toInstallation(doc) : null;
  },

  async list(
    filter: InstallationFilter,
    { skip, limit }: { skip: number; limit: number },
  ): Promise<{ items: Installation[]; total: number }> {
    const collection = await installationsCollection();
    const query = toQuery(filter);
    const [docs, total] = await Promise.all([
      collection.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      collection.countDocuments(query),
    ]);
    return { items: docs.map(toInstallation), total };
  },

  async listForVendor(vendorId: string): Promise<Installation[]> {
    if (!ObjectId.isValid(vendorId)) return [];
    const docs = await (
      await installationsCollection()
    )
      .find({ vendorId: new ObjectId(vendorId) })
      .sort({ createdAt: -1 })
      .toArray();
    return docs.map(toInstallation);
  },

  async listForCustomer(customerId: string): Promise<Installation[]> {
    if (!ObjectId.isValid(customerId)) return [];
    const docs = await (
      await installationsCollection()
    )
      .find({ customerId: new ObjectId(customerId) })
      .sort({ createdAt: -1 })
      .toArray();
    return docs.map(toInstallation);
  },

  /** Mark an installation as voided. Returns false if already voided or not found. */
  async void(id: string, reason: string): Promise<Installation | null> {
    if (!ObjectId.isValid(id)) return null;
    const doc = await (
      await installationsCollection()
    ).findOneAndUpdate(
      { _id: new ObjectId(id), voidedAt: { $exists: false } },
      { $set: { voidedAt: new Date(), voidReason: reason } },
      { returnDocument: 'after' },
    );
    return doc ? toInstallation(doc) : null;
  },

  async countForVendor(vendorId: string): Promise<number> {
    if (!ObjectId.isValid(vendorId)) return 0;
    return (await installationsCollection()).countDocuments({ vendorId: new ObjectId(vendorId) });
  },
};
