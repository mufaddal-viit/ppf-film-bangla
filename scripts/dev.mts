/**
 * `pnpm dev`: one command for local development, no Docker needed.
 * If MONGODB_URI is unset or points at the local default, starts MongoDB (data persisted in .data/mongo),
 * applies collections and indexes, then runs `next dev` against it.
 */
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { loadEnv } from './load-env.mts';

loadEnv();

const LOCAL_URI = 'mongodb://127.0.0.1:27018/';
let stopDatabase: (() => Promise<unknown>) | undefined;

if (!process.env.MONGODB_URI || process.env.MONGODB_URI === LOCAL_URI) {
  const { MongoMemoryServer } = await import('mongodb-memory-server');
  mkdirSync('.data/mongo', { recursive: true });
  const server = await MongoMemoryServer.create({
    instance: { dbPath: '.data/mongo', storageEngine: 'wiredTiger', port: 27018 },
  });
  process.env.MONGODB_URI = LOCAL_URI;
  stopDatabase = () => server.stop({ doCleanup: false });
  console.log(`Local MongoDB running at ${process.env.MONGODB_URI} (data in .data/mongo)`);
}

const { getDb, closeDb } = await import('../src/lib/db/client');
const { ensureSchema } = await import('../src/lib/db/collections');
await ensureSchema(await getDb());
await closeDb();

const nextBin = fileURLToPath(import.meta.resolve('next/dist/bin/next'));
const next = spawn(process.execPath, [nextBin, 'dev', ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: process.env,
});

const shutdown = async (code = 0) => {
  next.kill();
  await stopDatabase?.();
  process.exit(code);
};
process.on('SIGINT', () => void shutdown());
process.on('SIGTERM', () => void shutdown());
next.on('exit', (code) => void shutdown(code ?? 0));
