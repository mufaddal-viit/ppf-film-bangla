import 'server-only';
import { ObjectId } from 'mongodb';
import { sessionsCollection } from '../collections';

/** Sessions are looked up by the hash of the cookie value. Expired rows are removed by a TTL index. */
export const sessionRepository = {
  async create(input: { tokenHash: string; userId: string; expires: Date }): Promise<void> {
    await (
      await sessionsCollection()
    ).insertOne({
      sessionToken: input.tokenHash,
      userId: new ObjectId(input.userId),
      expires: input.expires,
      createdAt: new Date(),
    });
  },

  async findValid(tokenHash: string): Promise<{ userId: string; expires: Date } | null> {
    const doc = await (await sessionsCollection()).findOne({ sessionToken: tokenHash, expires: { $gt: new Date() } });
    return doc ? { userId: doc.userId.toHexString(), expires: doc.expires } : null;
  },

  async extend(tokenHash: string, expires: Date): Promise<void> {
    await (await sessionsCollection()).updateOne({ sessionToken: tokenHash }, { $set: { expires } });
  },

  async delete(tokenHash: string): Promise<void> {
    await (await sessionsCollection()).deleteOne({ sessionToken: tokenHash });
  },

  /** Signs a user out everywhere, optionally keeping the session that made the request. */
  async deleteForUser(userId: string, exceptTokenHash?: string): Promise<void> {
    await (
      await sessionsCollection()
    ).deleteMany({
      userId: new ObjectId(userId),
      ...(exceptTokenHash && { sessionToken: { $ne: exceptTokenHash } }),
    });
  },
};
