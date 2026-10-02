import 'server-only';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

/** Server-side Cloudflare Turnstile check. Fails closed on network errors. */
export async function verifyTurnstile(token: string | undefined, ip: string): Promise<boolean> {
  if (!token) return false;
  try {
    const body = new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY, response: token });
    if (ip !== 'unknown') body.set('remoteip', ip);
    const res = await fetch(VERIFY_URL, { method: 'POST', body, signal: AbortSignal.timeout(5_000) });
    const data = (await res.json()) as { success?: boolean; 'error-codes'?: string[] };
    if (!data.success) logger.warn('turnstile.rejected', { codes: data['error-codes']?.join(',') });
    return data.success === true;
  } catch (error) {
    logger.error('turnstile.unavailable', {}, error);
    return false;
  }
}
