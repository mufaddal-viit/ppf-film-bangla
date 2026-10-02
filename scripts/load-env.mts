import { existsSync } from 'node:fs';

/** Loads .env.local then .env (first value wins), matching Next.js precedence for scripts. */
export function loadEnv(): void {
  for (const file of ['.env.local', '.env']) {
    if (existsSync(file)) process.loadEnvFile(file);
  }
  // Empty values in env files mean "unset" (e.g. MONGODB_URI= triggers the in-memory database).
  for (const [key, value] of Object.entries(process.env)) {
    if (value === '') delete process.env[key];
  }
}
