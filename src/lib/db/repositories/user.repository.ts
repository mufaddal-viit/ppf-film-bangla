import 'server-only';
import { ObjectId, type WithId } from 'mongodb';
import type { UserRole } from '@/lib/admin/constants';
import { usersCollection, type UserDocument } from '../collections';

/** What the rest of the app sees: never the password hash. */
type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  active: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
};

type UserWithHash = User & { passwordHash: string };

function toUser(doc: WithId<UserDocument>): UserWithHash {
  return {
    id: doc._id.toHexString(),
    email: doc.email,
    name: doc.name,
    role: doc.role,
    active: doc.active,
    lastLoginAt: doc.lastLoginAt ?? null,
    createdAt: doc.createdAt,
    passwordHash: doc.passwordHash,
  };
}

function withoutHash(user: UserWithHash): User {
  const { passwordHash, ...rest } = user;
  void passwordHash;
  return rest;
}

const byId = (id: string) => ({ _id: new ObjectId(id) });

export const userRepository = {
  /** Includes the hash: only for checking a password. */
  async findByEmailWithHash(email: string): Promise<UserWithHash | null> {
    const doc = await (await usersCollection()).findOne({ email: email.toLowerCase() });
    return doc ? toUser(doc) : null;
  },

  async findByIdWithHash(id: string): Promise<UserWithHash | null> {
    if (!ObjectId.isValid(id)) return null;
    const doc = await (await usersCollection()).findOne(byId(id));
    return doc ? toUser(doc) : null;
  },

  async findById(id: string): Promise<User | null> {
    const user = await this.findByIdWithHash(id);
    return user ? withoutHash(user) : null;
  },

  async list(): Promise<User[]> {
    const docs = await (await usersCollection()).find().sort({ createdAt: 1 }).toArray();
    return docs.map((doc) => withoutHash(toUser(doc)));
  },

  async countActiveOwners(): Promise<number> {
    return (await usersCollection()).countDocuments({ role: 'owner', active: true });
  },

  async create(input: { email: string; name: string; role: UserRole; passwordHash: string }): Promise<{ id: string }> {
    const now = new Date();
    const result = await (
      await usersCollection()
    ).insertOne({ ...input, email: input.email.toLowerCase(), active: true, createdAt: now, updatedAt: now });
    return { id: result.insertedId.toHexString() };
  },

  async update(
    id: string,
    patch: Partial<Pick<UserDocument, 'name' | 'role' | 'active' | 'passwordHash' | 'lastLoginAt'>>,
  ): Promise<void> {
    await (await usersCollection()).updateOne(byId(id), { $set: { ...patch, updatedAt: new Date() } });
  },
};

/** MongoDB's duplicate key error, raised by the unique index on users.email. */
export function isDuplicateKeyError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 11000;
}
