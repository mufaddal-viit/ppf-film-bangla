import 'server-only';
import { ObjectId, type WithId } from 'mongodb';
import type { PostStatus } from '@/lib/admin/constants';
import { postsCollection, type PostDocument } from '../collections';

export type Post = Omit<PostDocument, '_id' | 'publishedAt'> & { id: string; publishedAt: Date | null };

export type PostInput = Omit<PostDocument, '_id' | 'createdAt' | 'updatedAt'>;

function toPost({ _id, publishedAt, ...doc }: WithId<PostDocument>): Post {
  return { id: _id.toHexString(), publishedAt: publishedAt ?? null, ...doc };
}

const byId = (id: string) => ({ _id: new ObjectId(id) });

export const postRepository = {
  /** Every post, newest first, for the admin list. */
  async list(): Promise<Post[]> {
    const docs = await (await postsCollection()).find().sort({ updatedAt: -1 }).toArray();
    return docs.map(toPost);
  },

  /** Posts visitors can read in a language: published, not scheduled for later, translated. */
  async listPublished(locale: string): Promise<Post[]> {
    const docs = await (
      await postsCollection()
    )
      .find({ status: 'published', publishedAt: { $lte: new Date() }, [`translations.${locale}`]: { $exists: true } })
      .sort({ publishedAt: -1 })
      .toArray();
    return docs.map(toPost);
  },

  async findById(id: string): Promise<Post | null> {
    if (!ObjectId.isValid(id)) return null;
    const doc = await (await postsCollection()).findOne(byId(id));
    return doc ? toPost(doc) : null;
  },

  async findBySlug(slug: string): Promise<Post | null> {
    const doc = await (await postsCollection()).findOne({ slug });
    return doc ? toPost(doc) : null;
  },

  async create(input: PostInput): Promise<{ id: string }> {
    const now = new Date();
    const result = await (await postsCollection()).insertOne({ ...input, createdAt: now, updatedAt: now });
    return { id: result.insertedId.toHexString() };
  },

  /** Replaces the editable fields. False when the post does not exist. */
  async update(id: string, input: PostInput): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false;
    const { publishedAt, cover, ...rest } = input;
    const unset = { ...(!publishedAt && { publishedAt: '' as const }), ...(!cover && { cover: '' as const }) };
    const result = await (
      await postsCollection()
    ).updateOne(byId(id), {
      $set: { ...rest, ...(publishedAt && { publishedAt }), ...(cover && { cover }), updatedAt: new Date() },
      ...(Object.keys(unset).length > 0 && { $unset: unset }),
    });
    return result.matchedCount === 1;
  },

  async delete(id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false;
    return (await (await postsCollection()).deleteOne(byId(id))).deletedCount === 1;
  },

  async counts(): Promise<Record<PostStatus, number>> {
    const collection = await postsCollection();
    const [draft, published] = await Promise.all([
      collection.countDocuments({ status: 'draft' }),
      collection.countDocuments({ status: 'published' }),
    ]);
    return { draft, published };
  },
};
