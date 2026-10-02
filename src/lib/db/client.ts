import 'server-only';
import { attachDatabasePool } from '@vercel/functions';
import { MongoClient, type Db } from 'mongodb';
import { env } from '@/lib/env';

/**
 * One MongoClient per server instance, reused across requests and hot reloads.
 * attachDatabasePool lets Vercel Fluid Compute release idle connections before suspending.
 */
const globalForMongo = globalThis as typeof globalThis & { __mongoClient?: Promise<MongoClient> };

function connect(): Promise<MongoClient> {
  const client = new MongoClient(env.MONGODB_URI, {
    maxPoolSize: 10,
    maxIdleTimeMS: 5_000,
    serverSelectionTimeoutMS: 5_000,
    appName: 'ppf-film-bangla',
  });
  attachDatabasePool(client);
  return client.connect();
}

export async function getDb(): Promise<Db> {
  globalForMongo.__mongoClient ??= connect().catch((error: unknown) => {
    globalForMongo.__mongoClient = undefined; // allow a retry on the next request
    throw error;
  });
  return (await globalForMongo.__mongoClient).db(env.MONGODB_DB);
}

export async function closeDb(): Promise<void> {
  const client = await globalForMongo.__mongoClient;
  globalForMongo.__mongoClient = undefined;
  await client?.close();
}
