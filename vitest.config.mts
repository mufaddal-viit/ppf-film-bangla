import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const empty = fileURLToPath(new URL('./tests/unit/empty-module.ts', import.meta.url));

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    // Next.js guards these at bundle time; in unit tests they are no-ops.
    alias: { 'server-only': empty, 'client-only': empty },
  },
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
    env: {
      NEXT_PUBLIC_SITE_URL: 'https://www.example.ae',
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: '1x00000000000000000000AA',
      TURNSTILE_SECRET_KEY: '1x0000000000000000000000000000000AA',
      MONGODB_URI: 'mongodb://127.0.0.1:1/test',
      LEAD_NOTIFICATION_TO: 'leads@example.com',
    },
  },
});
