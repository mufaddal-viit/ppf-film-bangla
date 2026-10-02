import 'server-only';
import type { Db, Document, IndexDescription, ObjectId } from 'mongodb';
import type { LeadType } from '@/lib/config/schema';
import { getDb } from './client';

const LEAD_STATUSES = ['new', 'contacted', 'quoted', 'won', 'lost', 'spam'] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

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
  createdAt: Date;
  updatedAt: Date;
};

const COLLECTIONS = {
  leads: 'leads',
  // Reserved for phase 2 auth. The auth library's MongoDB adapter owns their documents.
  users: 'users',
  accounts: 'accounts',
  sessions: 'sessions',
  verificationTokens: 'verificationTokens',
} as const;

export async function leadsCollection() {
  return (await getDb()).collection<LeadDocument>(COLLECTIONS.leads);
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
  [COLLECTIONS.leads]: [{ key: { createdAt: -1 } }, { key: { status: 1, createdAt: -1 } }, { key: { phone: 1 } }],
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
