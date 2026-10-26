import 'server-only';
import { ObjectId, type WithId } from 'mongodb';
import { rollsCollection, type RollDocument } from '../collections';

export type Roll = {
  id: string;
  vendorId: string;
  productId: string;
  lotNumber: string;
  widthCm: number;
  lengthM: number;
  usedM: number;
  createdAt: Date;
};

export type RollInput = Pick<Roll, 'vendorId' | 'productId' | 'lotNumber' | 'widthCm' | 'lengthM'>;

function toRoll(doc: WithId<RollDocument>): Roll {
  return {
    id: doc._id.toHexString(),
    vendorId: doc.vendorId.toHexString(),
    productId: doc.productId.toHexString(),
    lotNumber: doc.lotNumber,
    widthCm: doc.widthCm,
    lengthM: doc.lengthM,
    usedM: doc.usedM,
    createdAt: doc.createdAt,
  };
}

/** Rolls of film allocated to vendors. LOT numbers are unique without regard to case (unique index on lotKey). */
export const rollRepository = {
  /** Every roll at every shop, newest first. Admin only. */
  async list(): Promise<Roll[]> {
    const docs = await (await rollsCollection()).find().sort({ createdAt: -1 }).toArray();
    return docs.map(toRoll);
  },

  /** The vendor portal passes the vendor id from the signed-in session, never one from the page. */
  async listForVendor(vendorId: string): Promise<Roll[]> {
    if (!ObjectId.isValid(vendorId)) return [];
    const docs = await (
      await rollsCollection()
    )
      .find({ vendorId: new ObjectId(vendorId) })
      .sort({ createdAt: -1 })
      .toArray();
    return docs.map(toRoll);
  },

  async create(input: RollInput): Promise<{ id: string }> {
    const now = new Date();
    const result = await (
      await rollsCollection()
    ).insertOne({
      vendorId: new ObjectId(input.vendorId),
      productId: new ObjectId(input.productId),
      lotNumber: input.lotNumber,
      lotKey: input.lotNumber.toUpperCase(),
      widthCm: input.widthCm,
      lengthM: input.lengthM,
      usedM: 0,
      createdAt: now,
      updatedAt: now,
    });
    return { id: result.insertedId.toHexString() };
  },

  /**
   * Takes back a roll nothing has been cut from. Null when the roll is gone or already in use;
   * the usedM check is part of the delete, so an installation recorded at the same moment wins.
   */
  async removeUnused(id: string): Promise<Roll | null> {
    if (!ObjectId.isValid(id)) return null;
    const doc = await (await rollsCollection()).findOneAndDelete({ _id: new ObjectId(id), usedM: 0 });
    return doc ? toRoll(doc) : null;
  },

  /**
   * Atomically deduct metres from a roll. The update only succeeds when usedM + metres <= lengthM,
   * so two concurrent installations cannot overcommit the roll. Returns false when the roll does
   * not exist or does not have enough film left.
   */
  async deductMetres(id: string, metres: number): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false;
    const result = await (
      await rollsCollection()
    ).updateOne(
      { _id: new ObjectId(id), $expr: { $lte: [{ $add: ['$usedM', metres] }, '$lengthM'] } },
      { $inc: { usedM: metres }, $set: { updatedAt: new Date() } },
    );
    return result.modifiedCount === 1;
  },

  /** Restore metres after voiding an installation. No guard — the caller has already validated. */
  async restoreMetres(id: string, metres: number): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false;
    const result = await (
      await rollsCollection()
    ).updateOne({ _id: new ObjectId(id) }, { $inc: { usedM: -metres }, $set: { updatedAt: new Date() } });
    return result.modifiedCount === 1;
  },

  async findById(id: string): Promise<Roll | null> {
    if (!ObjectId.isValid(id)) return null;
    const doc = await (await rollsCollection()).findOne({ _id: new ObjectId(id) });
    return doc ? toRoll(doc) : null;
  },
};
