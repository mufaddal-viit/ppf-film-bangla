import 'server-only';
import { headers } from 'next/headers';
import { publicEnv } from '@/lib/env.public';

export type RequestMeta = { ip: string; origin: string | null; host: string | null };

/** Client IP and origin data for the current request. On Vercel, x-real-ip is set by the platform. */
export async function getRequestMeta(): Promise<RequestMeta> {
  const h = await headers();
  const ip = h.get('x-real-ip') ?? h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  return { ip, origin: h.get('origin'), host: h.get('x-forwarded-host') ?? h.get('host') };
}

/**
 * Mutations must come from our own pages. Next.js already compares Origin and Host for
 * Server Actions; this repeats the check explicitly and also accepts the canonical site URL.
 */
export function isAllowedOrigin({ origin, host }: Pick<RequestMeta, 'origin' | 'host'>): boolean {
  if (!origin) return false;
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    return false;
  }
  return originHost === host || originHost === new URL(publicEnv.NEXT_PUBLIC_SITE_URL).host;
}
