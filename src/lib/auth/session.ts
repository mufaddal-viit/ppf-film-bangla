import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { ADMIN_ROUTES, SESSION_COOKIE, type UserRole } from '@/lib/admin/constants';
import type { SessionScope } from '@/lib/db/collections';
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
 * Database sessions for one sign-in (admin panel or vendor portal). The cookie holds a random token;
 * the database stores only its hash. Each sign-in has its own cookie name, cookie path and scope,
 * so its cookie is not sent to the other portal and its token is not accepted there either.
 */
export function sessionStore({ scope, cookie, path }: { scope: SessionScope; cookie: string; path: string }) {
  async function currentTokenHash(): Promise<string | null> {
    const token = (await cookies()).get(cookie)?.value;
    return token ? hashToken(token) : null;
  }

  return {
    async create(userId: string): Promise<void> {
      const token = randomBytes(32).toString('base64url');
      await sessionRepository.create({
        tokenHash: hashToken(token),
        userId,
        scope,
        expires: new Date(Date.now() + IDLE_DAYS * DAY_MS),
      });
      (await cookies()).set(cookie, token, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        path,
        maxAge: MAX_DAYS * 86_400,
      });
    },

    /** The user id behind the current cookie, or null. Checked against the database on every request. */
    async currentUserId(): Promise<string | null> {
      const tokenHash = await currentTokenHash();
      if (!tokenHash) return null;
      const session = await sessionRepository.findValid(tokenHash, scope);
      if (!session) return null;
      // Slide the expiry at most once a day to avoid a write on every request.
      if (session.expires.getTime() - Date.now() < (IDLE_DAYS - 1) * DAY_MS) {
        await sessionRepository.extend(tokenHash, new Date(Date.now() + IDLE_DAYS * DAY_MS));
      }
      return session.userId;
    },

    async destroy(): Promise<void> {
      const tokenHash = await currentTokenHash();
      if (tokenHash) await sessionRepository.delete(tokenHash);
      (await cookies()).delete({ name: cookie, path });
    },

    /** After a password change: every other device is signed out. */
    async destroyOthers(userId: string): Promise<void> {
      await sessionRepository.deleteForUser(userId, (await currentTokenHash()) ?? undefined);
    },
  };
}

/** The cookie is scoped to /admin, so it is never sent with public page requests. */
const adminSessions = sessionStore({ scope: 'admin', cookie: SESSION_COOKIE, path: ADMIN_ROUTES.dashboard });

export const createSession = adminSessions.create;
export const destroySession = adminSessions.destroy;
export const destroyOtherSessions = adminSessions.destroyOthers;

/** The signed-in admin user, or null (looked up once per render). */
export const getSession = cache(async (): Promise<Session | null> => {
  const userId = await adminSessions.currentUserId();
  if (!userId) return null;
  const user = await userRepository.findById(userId);
  if (!user?.active) return null;
  return { userId: user.id, email: user.email, name: user.name, role: user.role };
});

/** For pages: sends signed-out visitors to the login page and staff away from owner-only pages. */
export async function requireSession(role?: UserRole): Promise<Session> {
  const session = await getSession();
  if (!session) redirect(ADMIN_ROUTES.login);
  if (role && session.role !== role) redirect(ADMIN_ROUTES.dashboard);
  return session;
}
