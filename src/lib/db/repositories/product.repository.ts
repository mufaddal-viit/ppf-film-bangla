import 'server-only';
import { ObjectId, type WithId } from 'mongodb';
import { productsCollection, type ProductDocument } from '../collections';

export type Product = Omit<ProductDocument, '_id' | 'nameKey'> & { id: string };

export type ProductInput = Pick<Product, 'name' | 'finish' | 'warrantyYears' | 'description' | 'active'>;

function toProduct({ _id, nameKey, ...doc }: WithId<ProductDocument>): Product {
  void nameKey;
  return { id: _id.toHexString(), ...doc };
}

/** Optional text is removed from the document when cleared, not stored as an empty string. */
function toFields({ description, ...rest }: ProductInput) {
  return { set: { ...rest, nameKey: rest.name.toLowerCase(), ...(description && { description }) }, description };
}

/** Films the business sells. Names are unique without regard to case (unique index on nameKey). */
export const productRepository = {
  async list(): Promise<Product[]> {
    const docs = await (await productsCollection()).find().sort({ active: -1, nameKey: 1 }).toArray();
    return docs.map(toProduct);
  },

  async findById(id: string): Promise<Product | null> {
    if (!ObjectId.isValid(id)) return null;
    const doc = await (await productsCollection()).findOne({ _id: new ObjectId(id) });
    return doc ? toProduct(doc) : null;
  },

  async create(input: ProductInput): Promise<{ id: string }> {
    const now = new Date();
    const result = await (
      await productsCollection()
    ).insertOne({ ...toFields(input).set, createdAt: now, updatedAt: now });
    return { id: result.insertedId.toHexString() };
  },

  /** False when the product does not exist. */
  async update(id: string, input: ProductInput): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false;
    const { set, description } = toFields(input);
    const result = await (
      await productsCollection()
    ).updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...set, updatedAt: new Date() }, ...(!description && { $unset: { description: '' } }) },
    );
    return result.matchedCount === 1;
  },
};
