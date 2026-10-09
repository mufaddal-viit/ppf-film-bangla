import 'server-only';
import { ObjectId } from 'mongodb';
import { sessionsCollection, type SessionScope } from '../collections';

/** Admin sessions carry no scope field; every other sign-in stores its own. */
const scopeQuery = (scope: SessionScope) => (scope === 'admin' ? { scope: { $exists: false } } : { scope });

/** Sessions are looked up by the hash of the cookie value. Expired rows are removed by a TTL index. */
export const sessionRepository = {
  async create(input: { tokenHash: string; userId: string; expires: Date; scope: SessionScope }): Promise<void> {
    await (
      await sessionsCollection()
    ).insertOne({
      sessionToken: input.tokenHash,
      userId: new ObjectId(input.userId),
      ...(input.scope !== 'admin' && { scope: input.scope }),
      expires: input.expires,
      createdAt: new Date(),
    });
  },

  /** The scope is part of the lookup, so a token from one portal is never accepted by another. */
  async findValid(tokenHash: string, scope: SessionScope): Promise<{ userId: string; expires: Date } | null> {
    const doc = await (
      await sessionsCollection()
    ).findOne({ sessionToken: tokenHash, expires: { $gt: new Date() }, ...scopeQuery(scope) });
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

  async deleteForUsers(userIds: string[]): Promise<void> {
    if (userIds.length === 0) return;
    await (await sessionsCollection()).deleteMany({ userId: { $in: userIds.map((id) => new ObjectId(id)) } });
  },
};
