import 'server-only';
import type { Db, Document, IndexDescription, ObjectId } from 'mongodb';
import { LEAD_STATUSES, type LeadStatus, type PostStatus, type UserRole } from '@/lib/admin/constants';
import type { LeadType } from '@/lib/config/schema';
import { getDb } from './client';

export type LeadNote = { id: string; text: string; authorName: string; at: Date };

export type LeadDocument = {
  _id?: ObjectId;
  type: LeadType;
  status: LeadStatus;
  name: string;
  phone: string; // E.164
  email?: string;
  vehicle?: { make?: string; model?: string; year?: number };
  service?: string; // catalog slug
  preferredTime?: string;
  message?: string;
  locale: string;
  sourcePage: string;
  landingPage?: string;
  referrer?: string;
  utm?: { source?: string; medium?: string; campaign?: string; term?: string; content?: string };
  consent: { given: true; at: Date; policyVersion: string };
  /** Staff notes, oldest first. Added from the admin panel. */
  notes?: LeadNote[];
  followUpAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

/** Admin panel user. Emails are stored lowercase. */
export type UserDocument = {
  _id?: ObjectId;
  email: string;
  name: string;
  role: UserRole;
  passwordHash: string;
  active: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

/** Which sign-in a session belongs to. Admin sessions predate the field and are stored without it. */
export type SessionScope = 'admin' | 'vendor';

/** sessionToken holds the SHA-256 of the cookie value, so a database leak cannot be replayed. */
type SessionDocument = {
  _id?: ObjectId;
  sessionToken: string;
  userId: ObjectId;
  scope?: Exclude<SessionScope, 'admin'>;
  expires: Date;
  createdAt: Date;
};

export type AuditDocument = {
  _id?: ObjectId;
  at: Date;
  actorId: string;
  actorEmail: string;
  /** Dotted event name, e.g. "lead.status_changed". */
  action: string;
  target?: string;
  detail?: string;
};

export type PostTranslation = {
  title: string;
  excerpt: string;
  /** Markdown subset, see src/lib/blog/markdown.ts. */
  body: string;
  seoTitle?: string;
  seoDescription?: string;
};

/** Blog post. A post shows in a language only when it has that translation. */
export type PostDocument = {
  _id?: ObjectId;
  slug: string;
  status: PostStatus;
  /** A date in the future schedules the post. */
  publishedAt?: Date;
  author: string;
  /** Site image path, one of BLOG_COVERS. */
  cover?: string;
  tags: string[];
  translations: { en: PostTranslation; ar?: PostTranslation };
  createdAt: Date;
  updatedAt: Date;
};

export type CustomerVehicle = { id: string; make: string; model: string; year?: number; plate?: string };

/** A person who has bought from the business. Phones are E.164 and unique. */
export type CustomerDocument = {
  _id?: ObjectId;
  name: string;
  phone: string;
  email?: string;
  vehicles: CustomerVehicle[];
  tags: string[];
  /** True only when the customer agreed to receive offers. */
  marketingOptIn: boolean;
  notes: LeadNote[];
  /** The enquiry this customer was created from, if any. */
  leadId?: string;
  lastContactedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

/** A film the business sells. The warranty length here sets the coverage period on a warranty card. */
export type ProductDocument = {
  _id?: ObjectId;
  name: string;
  /** Lowercase name, unique, so "Apex" and "apex" cannot both exist. */
  nameKey: string;
  finish: string;
  warrantyYears: number;
  description?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

/** An installation shop. Its people sign in to the vendor portal with portal users. */
export type VendorDocument = {
  _id?: ObjectId;
  shopName: string;
  contactName: string;
  email: string;
  phone: string; // E.164
  address: string;
  /** People who fit film at this shop; one is named on each warranty card. */
  installers: string[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

/** A sign-in for the vendor portal. Kept apart from admin users so a vendor can never hold an admin role. */
export type PortalUserDocument = {
  _id?: ObjectId;
  kind: 'vendor';
  vendorId: ObjectId;
  email: string;
  name: string;
  passwordHash: string;
  active: boolean;
  /** True until the person replaces the temporary password they were given. */
  mustChangePassword: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

/** One roll of film allocated to a vendor. Installations use it up; a warranty names its LOT number. */
export type RollDocument = {
  _id?: ObjectId;
  vendorId: ObjectId;
  productId: ObjectId;
  lotNumber: string;
  /** Uppercase LOT number, unique, so the same roll cannot be allocated twice. */
  lotKey: string;
  widthCm: number;
  lengthM: number;
  /** Metres already fitted. Never more than lengthM. */
  usedM: number;
  createdAt: Date;
  updatedAt: Date;
};

const COLLECTIONS = {
  leads: 'leads',
  products: 'products',
  vendors: 'vendors',
  rolls: 'rolls',
  portalUsers: 'portalUsers',
  posts: 'posts',
  customers: 'customers',
  users: 'users',
  sessions: 'sessions',
  auditLog: 'auditLog',
  // Reserved: OAuth accounts and emailed tokens (password reset links).
  accounts: 'accounts',
  verificationTokens: 'verificationTokens',
} as const;

export async function leadsCollection() {
  return (await getDb()).collection<LeadDocument>(COLLECTIONS.leads);
}

export async function usersCollection() {
  return (await getDb()).collection<UserDocument>(COLLECTIONS.users);
}

export async function sessionsCollection() {
  return (await getDb()).collection<SessionDocument>(COLLECTIONS.sessions);
}

export async function auditCollection() {
  return (await getDb()).collection<AuditDocument>(COLLECTIONS.auditLog);
}

export async function postsCollection() {
  return (await getDb()).collection<PostDocument>(COLLECTIONS.posts);
}

export async function customersCollection() {
  return (await getDb()).collection<CustomerDocument>(COLLECTIONS.customers);
}

export async function productsCollection() {
  return (await getDb()).collection<ProductDocument>(COLLECTIONS.products);
}

export async function vendorsCollection() {
  return (await getDb()).collection<VendorDocument>(COLLECTIONS.vendors);
}

export async function rollsCollection() {
  return (await getDb()).collection<RollDocument>(COLLECTIONS.rolls);
}

export async function portalUsersCollection() {
  return (await getDb()).collection<PortalUserDocument>(COLLECTIONS.portalUsers);
}

/** Database-level guard in addition to Zod: required fields, types and length caps. */
const leadValidator: Document = {
  $jsonSchema: {
    bsonType: 'object',
    required: ['type', 'status', 'name', 'phone', 'locale', 'sourcePage', 'consent', 'createdAt', 'updatedAt'],
    properties: {
      type: { enum: ['quote', 'contact', 'callback'] },
      status: { enum: [...LEAD_STATUSES] },
      name: { bsonType: 'string', maxLength: 100 },
      phone: { bsonType: 'string', pattern: '^\\+[1-9]\\d{6,14}$' },
      email: { bsonType: 'string', maxLength: 254 },
      service: { bsonType: 'string', maxLength: 64 },
      preferredTime: { bsonType: 'string', maxLength: 100 },
      message: { bsonType: 'string', maxLength: 2000 },
      locale: { bsonType: 'string', maxLength: 8 },
      sourcePage: { bsonType: 'string', maxLength: 500 },
      consent: {
        bsonType: 'object',
        required: ['given', 'at', 'policyVersion'],
        properties: { given: { enum: [true] }, at: { bsonType: 'date' }, policyVersion: { bsonType: 'string' } },
      },
      createdAt: { bsonType: 'date' },
      updatedAt: { bsonType: 'date' },
    },
  },
};

const INDEXES: Record<string, IndexDescription[]> = {
  [COLLECTIONS.leads]: [
    { key: { createdAt: -1 } },
    { key: { status: 1, createdAt: -1 } },
    { key: { phone: 1 } },
    { key: { followUpAt: 1 }, sparse: true },
  ],
  [COLLECTIONS.auditLog]: [{ key: { at: -1 } }],
  [COLLECTIONS.posts]: [{ key: { slug: 1 }, unique: true }, { key: { status: 1, publishedAt: -1 } }],
  [COLLECTIONS.customers]: [{ key: { phone: 1 }, unique: true }, { key: { createdAt: -1 } }],
  [COLLECTIONS.users]: [{ key: { email: 1 }, unique: true, sparse: true }],
  [COLLECTIONS.products]: [{ key: { nameKey: 1 }, unique: true }],
  [COLLECTIONS.vendors]: [{ key: { createdAt: -1 } }],
  [COLLECTIONS.rolls]: [{ key: { lotKey: 1 }, unique: true }, { key: { vendorId: 1, createdAt: -1 } }],
  [COLLECTIONS.portalUsers]: [{ key: { email: 1 }, unique: true }, { key: { vendorId: 1 } }],
  [COLLECTIONS.accounts]: [{ key: { provider: 1, providerAccountId: 1 }, unique: true }, { key: { userId: 1 } }],
  [COLLECTIONS.sessions]: [
    { key: { sessionToken: 1 }, unique: true },
    { key: { expires: 1 }, expireAfterSeconds: 0 },
  ],
  [COLLECTIONS.verificationTokens]: [
    { key: { identifier: 1, token: 1 }, unique: true },
    { key: { expires: 1 }, expireAfterSeconds: 0 },
  ],
};

/** Idempotent: creates collections, validators and indexes. Run by scripts/db-setup.ts on deploy. */
export async function ensureSchema(db: Db): Promise<void> {
  const existing = new Set((await db.listCollections({}, { nameOnly: true }).toArray()).map((c) => c.name));
  if (!existing.has(COLLECTIONS.leads)) await db.createCollection(COLLECTIONS.leads, { validator: leadValidator });
  else await db.command({ collMod: COLLECTIONS.leads, validator: leadValidator });

  for (const [name, indexes] of Object.entries(INDEXES)) {
    await db.collection(name).createIndexes(indexes);
  }
}
