import { z } from 'zod';
import { envFallbacks } from './env.schema';

// Temporary placeholders for unset variables, see ENFORCE_PRODUCTION_ENV in env.schema.ts.
const fallbacks = envFallbacks({
  VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL,
  VERCEL_URL: process.env.VERCEL_URL,
});

/**
 * Public (browser-exposed) environment. Each variable must be referenced literally
 * as process.env.NEXT_PUBLIC_* so Next.js can inline it at build time.
 */
export const publicEnv = z
  .object({
    NEXT_PUBLIC_SITE_URL: z.url(),
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().min(1),
  })
  .parse({
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || fallbacks.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_TURNSTILE_SITE_KEY:
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || fallbacks.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  });
