import 'server-only';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { createSession, destroyOtherSessions, destroySession, getSession } from '@/lib/auth/session';
import { securityConfig } from '@/lib/config';
import { auditRepository } from '@/lib/db/repositories/audit.repository';
import { userRepository } from '@/lib/db/repositories/user.repository';
import { logger } from '@/lib/logger';
import { rateLimit } from '@/lib/security/rate-limit';
import { getRequestMeta, isAllowedOrigin } from '@/lib/security/request';
import { ActionError, adminAction, toFormErrors } from './action';
import { ADMIN_ROUTES, PASSWORD_MIN_LENGTH } from './constants';
import type { FormState } from './form-state';

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Use at least ${PASSWORD_MIN_LENGTH} characters.`)
  .max(128, 'Use at most 128 characters.');

const loginSchema = z.object({
  email: z.email('Enter a valid email address.').max(254),
  password: z.string().min(1, 'Enter your password.').max(128),
});

const WRONG_CREDENTIALS = 'Email or password is incorrect.';

/** Verifying against a real hash when the email is unknown keeps response times the same either way. */
let decoyHash: Promise<string> | undefined;
const getDecoyHash = () => (decoyHash ??= hashPassword('decoy-password-never-matches'));

export async function login(_previous: FormState, formData: FormData): Promise<FormState> {
  try {
    const meta = await getRequestMeta();
    if (!isAllowedOrigin(meta)) return { ok: false, message: 'This request was blocked. Reload the page.' };

    const parsed = loginSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { ok: false, message: WRONG_CREDENTIALS, fieldErrors: toFormErrors(parsed.error) };
    const email = parsed.data.email.toLowerCase();

    // Limited per IP and per account, so one address cannot be attacked from many IPs.
    const rule = securityConfig.rateLimits.adminLogin;
    const [byIp, byEmail] = await Promise.all([
      rateLimit('admin-login-ip', meta.ip, rule),
      rateLimit('admin-login-email', email, rule),
    ]);
    if (!byIp.success || !byEmail.success) {
      logger.warn('admin.login_rate_limited');
      return { ok: false, message: 'Too many attempts. Wait a few minutes and try again.' };
    }

    const user = await userRepository.findByEmailWithHash(email);
    const passwordOk = await verifyPassword(parsed.data.password, user?.passwordHash ?? (await getDecoyHash()));
    if (!user || !user.active || !passwordOk) {
      logger.warn('admin.login_failed');
      return { ok: false, message: WRONG_CREDENTIALS };
    }

    await createSession(user.id);
    await Promise.all([
      userRepository.update(user.id, { lastLoginAt: new Date() }),
      auditRepository.record({ userId: user.id, email: user.email }, 'auth.signed_in'),
    ]);
  } catch (error) {
    logger.error('admin.login_error', {}, error);
    return { ok: false, message: 'Something went wrong. Try again.' };
  }
  redirect(ADMIN_ROUTES.dashboard);
}

export async function logout(): Promise<never> {
  const session = await getSession();
  await destroySession();
  if (session) await auditRepository.record(session, 'auth.signed_out');
  redirect(ADMIN_ROUTES.login);
}

export const changePassword = adminAction({
  name: 'account.change_password',
  schema: z.object({
    currentPassword: z.string().min(1, 'Enter your current password.').max(128),
    newPassword: passwordSchema,
  }),
  async handler({ currentPassword, newPassword }, session) {
    const user = await userRepository.findByIdWithHash(session.userId);
    if (!user || !(await verifyPassword(currentPassword, user.passwordHash))) {
      throw new ActionError('Your current password is incorrect.');
    }
    await userRepository.update(user.id, { passwordHash: await hashPassword(newPassword) });
    await destroyOtherSessions(user.id);
    await auditRepository.record(session, 'account.password_changed');
    return 'Password changed. Other devices have been signed out.';
  },
});
