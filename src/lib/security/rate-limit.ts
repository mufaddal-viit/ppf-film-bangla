import 'server-only';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { env } from '@/lib/env';

export type RateLimitRule = { requests: number; windowSeconds: number };
export type RateLimiter = (bucket: string, identifier: string, rule: RateLimitRule) => Promise<{ success: boolean }>;

/** Sliding window in Upstash Redis: shared across every serverless instance. */
function upstashLimiter(): RateLimiter {
  const redis = new Redis({ url: env.UPSTASH_REDIS_REST_URL!, token: env.UPSTASH_REDIS_REST_TOKEN! });
  const limiters = new Map<string, Ratelimit>();
  return async (bucket, identifier, rule) => {
    const key = `${bucket}:${rule.requests}:${rule.windowSeconds}`;
    let limiter = limiters.get(key);
    if (!limiter) {
      limiter = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(rule.requests, `${rule.windowSeconds} s`),
        prefix: `ratelimit:${bucket}`,
      });
      limiters.set(key, limiter);
    }
    const { success } = await limiter.limit(identifier);
    return { success };
  };
}

/** Per-process fixed window. Development and tests only: env validation forbids it in production. */
export function memoryLimiter(): RateLimiter {
  const hits = new Map<string, number[]>();
  return async (bucket, identifier, rule) => {
    const key = `${bucket}:${identifier}`;
    const now = Date.now();
    const recent = (hits.get(key) ?? []).filter((t) => now - t < rule.windowSeconds * 1000);
    recent.push(now);
    hits.set(key, recent);
    return { success: recent.length <= rule.requests };
  };
}

export const rateLimit: RateLimiter = env.RATE_LIMIT_STORE === 'upstash' ? upstashLimiter() : memoryLimiter();
