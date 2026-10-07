import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { ADMIN_ROUTES, SESSION_COOKIE, type UserRole } from '@/lib/admin/constants';
import { sessionRepository } from '@/lib/db/repositories/session.repository';
import { userRepository } from '@/lib/db/repositories/user.repository';
import { env } from '@/lib/env';

export type Session = { userId: string; email: string; name: string; role: UserRole };

const DAY_MS = 86_400_000;
/** A session ends after this long without use; each day of use pushes the expiry forward. */
const IDLE_DAYS = 7;
/** Hard limit: the cookie itself expires, however active the session is. */
const MAX_DAYS = 30;

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

/**
 * Database sessions. The cookie holds a random token; the database stores only its hash.
 * The cookie is scoped to /admin, so it is never sent with public page requests.
 */
export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString('base64url');
  await sessionRepository.create({
    tokenHash: hashToken(token),
    userId,
    expires: new Date(Date.now() + IDLE_DAYS * DAY_MS),
  });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: ADMIN_ROUTES.dashboard,
    maxAge: MAX_DAYS * 86_400,
  });
}

async function currentTokenHash(): Promise<string | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return token ? hashToken(token) : null;
}

/** The signed-in admin user, or null. Checked against the database on every request (once per render). */
export const getSession = cache(async (): Promise<Session | null> => {
  const tokenHash = await currentTokenHash();
  if (!tokenHash) return null;
  const session = await sessionRepository.findValid(tokenHash);
  if (!session) return null;
  const user = await userRepository.findById(session.userId);
  if (!user?.active) return null;

  // Slide the expiry at most once a day to avoid a write on every request.
  if (session.expires.getTime() - Date.now() < (IDLE_DAYS - 1) * DAY_MS) {
    await sessionRepository.extend(tokenHash, new Date(Date.now() + IDLE_DAYS * DAY_MS));
  }
  return { userId: user.id, email: user.email, name: user.name, role: user.role };
});

/** For pages: sends signed-out visitors to the login page and staff away from owner-only pages. */
export async function requireSession(role?: UserRole): Promise<Session> {
  const session = await getSession();
  if (!session) redirect(ADMIN_ROUTES.login);
  if (role && session.role !== role) redirect(ADMIN_ROUTES.dashboard);
  return session;
}

export async function destroySession(): Promise<void> {
  const tokenHash = await currentTokenHash();
  if (tokenHash) await sessionRepository.delete(tokenHash);
  (await cookies()).delete({ name: SESSION_COOKIE, path: ADMIN_ROUTES.dashboard });
}

/** After a password change: every other device is signed out. */
export async function destroyOtherSessions(userId: string): Promise<void> {
  await sessionRepository.deleteForUser(userId, (await currentTokenHash()) ?? undefined);
}
