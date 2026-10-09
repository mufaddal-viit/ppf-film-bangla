import 'server-only';
import { ObjectId, type WithId } from 'mongodb';
import { portalUsersCollection, type PortalUserDocument } from '../collections';

/** What the rest of the app sees: never the password hash. */
export type PortalUser = {
  id: string;
  vendorId: string;
  email: string;
  name: string;
  active: boolean;
  mustChangePassword: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
};

type PortalUserWithHash = PortalUser & { passwordHash: string };

function toUser(doc: WithId<PortalUserDocument>): PortalUserWithHash {
  return {
    id: doc._id.toHexString(),
    vendorId: doc.vendorId.toHexString(),
    email: doc.email,
    name: doc.name,
    active: doc.active,
    mustChangePassword: doc.mustChangePassword,
    lastLoginAt: doc.lastLoginAt ?? null,
    createdAt: doc.createdAt,
    passwordHash: doc.passwordHash,
  };
}

function withoutHash({ passwordHash, ...user }: PortalUserWithHash): PortalUser {
  void passwordHash;
  return user;
}

const byId = (id: string) => ({ _id: new ObjectId(id) });

/** Vendor portal sign-ins. Emails are stored lowercase and are unique. */
export const portalUserRepository = {
  /** Includes the hash: only for checking a password. */
  async findByEmailWithHash(email: string): Promise<PortalUserWithHash | null> {
    const doc = await (await portalUsersCollection()).findOne({ email: email.toLowerCase(), kind: 'vendor' });
    return doc ? toUser(doc) : null;
  },

  async findByIdWithHash(id: string): Promise<PortalUserWithHash | null> {
    if (!ObjectId.isValid(id)) return null;
    const doc = await (await portalUsersCollection()).findOne(byId(id));
    return doc ? toUser(doc) : null;
  },

  async findById(id: string): Promise<PortalUser | null> {
    const user = await this.findByIdWithHash(id);
    return user ? withoutHash(user) : null;
  },

  async listForVendor(vendorId: string): Promise<PortalUser[]> {
    if (!ObjectId.isValid(vendorId)) return [];
    const docs = await (
      await portalUsersCollection()
    )
      .find({ vendorId: new ObjectId(vendorId) })
      .sort({ createdAt: 1 })
      .toArray();
    return docs.map((doc) => withoutHash(toUser(doc)));
  },

  /** Number of sign-ins per vendor id, for the vendor list. */
  async countByVendor(): Promise<Record<string, number>> {
    const groups = await (
      await portalUsersCollection()
    )
      .aggregate<{ _id: ObjectId; count: number }>([{ $group: { _id: '$vendorId', count: { $sum: 1 } } }])
      .toArray();
    return Object.fromEntries(groups.map((group) => [group._id.toHexString(), group.count]));
  },

  /** New sign-ins always start with a temporary password that must be replaced. */
  async create(input: {
    vendorId: string;
    email: string;
    name: string;
    passwordHash: string;
  }): Promise<{ id: string }> {
    const now = new Date();
    const result = await (
      await portalUsersCollection()
    ).insertOne({
      kind: 'vendor',
      vendorId: new ObjectId(input.vendorId),
      email: input.email.toLowerCase(),
      name: input.name,
      passwordHash: input.passwordHash,
      active: true,
      mustChangePassword: true,
      createdAt: now,
      updatedAt: now,
    });
    return { id: result.insertedId.toHexString() };
  },

  async update(
    id: string,
    patch: Partial<Pick<PortalUserDocument, 'active' | 'passwordHash' | 'mustChangePassword' | 'lastLoginAt'>>,
  ): Promise<void> {
    await (await portalUsersCollection()).updateOne(byId(id), { $set: { ...patch, updatedAt: new Date() } });
  },
};
