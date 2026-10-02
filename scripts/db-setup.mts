/**
 * Creates collections, validators and indexes. Idempotent; runs before every Vercel build
 * (`vercel-build` script) and can be run by hand with `pnpm db:setup`.
 */
import { loadEnv } from './load-env.mts';

loadEnv();

const { getDb, closeDb } = await import('../src/lib/db/client');
const { ensureSchema } = await import('../src/lib/db/collections');

await ensureSchema(await getDb());
await closeDb();
console.log('Database schema is up to date.');
