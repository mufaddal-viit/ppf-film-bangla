/**
 * Environment variable schema. Pure module (no `server-only`, no path aliases) so
 * next.config.ts can validate at build time. Read values through src/lib/env.ts.
 */
import { z } from 'zod';

const TURNSTILE_TEST_KEY = /^[123]x0000000000000000000/;

/**
 * TEMPORARY, for the first deployments: while this is false the production-only rules are skipped
 * and envFallbacks() fills unset variables, so the site deploys with only MONGODB_URI set.
 * Before launch: set the real values in Vercel (see .env.example), set this to true, and
 * un-skip the production test in tests/unit/config.test.ts.
 */
const ENFORCE_PRODUCTION_ENV = false;

/**
 * Placeholders for unset variables: the Vercel deployment URL, a dummy notification address
 * and Cloudflare's always-pass Turnstile test keys (no bot protection).
 */
export function envFallbacks(source: Record<string, string | undefined>): Record<string, string> {
  if (ENFORCE_PRODUCTION_ENV) return {};
  const vercelHost = source.VERCEL_PROJECT_PRODUCTION_URL || source.VERCEL_URL;
  return {
    NEXT_PUBLIC_SITE_URL: vercelHost ? `https://${vercelHost}` : 'http://localhost:3000',
    LEAD_NOTIFICATION_TO: 'leads@example.com',
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: '1x00000000000000000000AA',
    TURNSTILE_SECRET_KEY: '1x0000000000000000000000000000000AA',
  };
}

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    /** Set automatically by Vercel: "production" | "preview" | "development". */
    VERCEL_ENV: z.enum(['production', 'preview', 'development']).optional(),

    NEXT_PUBLIC_SITE_URL: z.url(),

    MONGODB_URI: z.string().regex(/^mongodb(\+srv)?:\/\//, 'Must be a mongodb:// or mongodb+srv:// URI'),
    MONGODB_DB: z.string().min(1).default('ppf'),

    EMAIL_PROVIDER: z.enum(['resend', 'console']).default('console'),
    RESEND_API_KEY: z.string().startsWith('re_').optional(),
    EMAIL_FROM: z.string().min(3).optional(),
    LEAD_NOTIFICATION_TO: z
      .string()
      .min(3)
      .transform((v) => v.split(',').map((s) => s.trim()))
      .pipe(z.array(z.email()).nonempty()),

    RATE_LIMIT_STORE: z.enum(['upstash', 'memory']).default('memory'),
    UPSTASH_REDIS_REST_URL: z.url().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),

    NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().min(1),
    TURNSTILE_SECRET_KEY: z.string().min(1),
  })
  .superRefine((env, ctx) => {
    const require = (key: keyof typeof env, when: string) => {
      if (!env[key]) ctx.addIssue({ code: 'custom', path: [key], message: `Required when ${when}` });
    };
    if (env.EMAIL_PROVIDER === 'resend') {
      require('RESEND_API_KEY', 'EMAIL_PROVIDER=resend');
      require('EMAIL_FROM', 'EMAIL_PROVIDER=resend');
    }
    if (env.RATE_LIMIT_STORE === 'upstash') {
      require('UPSTASH_REDIS_REST_URL', 'RATE_LIMIT_STORE=upstash');
      require('UPSTASH_REDIS_REST_TOKEN', 'RATE_LIMIT_STORE=upstash');
    }
    if (ENFORCE_PRODUCTION_ENV && env.VERCEL_ENV === 'production') {
      const prodRule = (ok: boolean, path: string, message: string) => {
        if (!ok) ctx.addIssue({ code: 'custom', path: [path], message: `Production: ${message}` });
      };
      prodRule(env.EMAIL_PROVIDER === 'resend', 'EMAIL_PROVIDER', 'must be "resend"');
      prodRule(
        env.RATE_LIMIT_STORE === 'upstash',
        'RATE_LIMIT_STORE',
        'must be "upstash" (memory does not work across serverless instances)',
      );
      prodRule(
        !TURNSTILE_TEST_KEY.test(env.TURNSTILE_SECRET_KEY),
        'TURNSTILE_SECRET_KEY',
        'must not be a Cloudflare test key',
      );
      prodRule(
        !TURNSTILE_TEST_KEY.test(env.NEXT_PUBLIC_TURNSTILE_SITE_KEY),
        'NEXT_PUBLIC_TURNSTILE_SITE_KEY',
        'must not be a Cloudflare test key',
      );
    }
  });

type Env = z.infer<typeof envSchema>;

export function parseEnv(source: Record<string, string | undefined>): Env {
  // An empty value in an env file means "not set", so optional variables can be left blank.
  const set = Object.fromEntries(Object.entries(source).filter(([, v]) => v !== ''));
  const result = envSchema.safeParse({ ...envFallbacks(source), ...set });
  if (!result.success) {
    throw new Error(`Invalid environment variables (see .env.example):\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}
