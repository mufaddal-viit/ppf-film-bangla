import 'server-only';
import type { Db, Document, IndexDescription, ObjectId } from 'mongodb';
import { LEAD_STATUSES, type LeadStatus, type UserRole } from '@/lib/admin/constants';
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

/** sessionToken holds the SHA-256 of the cookie value, so a database leak cannot be replayed. */
type SessionDocument = {
  _id?: ObjectId;
  sessionToken: string;
  userId: ObjectId;
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

const COLLECTIONS = {
  leads: 'leads',
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
  [COLLECTIONS.users]: [{ key: { email: 1 }, unique: true, sparse: true }],
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
