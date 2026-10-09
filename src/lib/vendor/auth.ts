import 'server-only';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { ActionError, portalAction, toFormErrors } from '@/lib/admin/action';
import { passwordSchema } from '@/lib/admin/auth';
import type { FormState } from '@/lib/admin/form-state';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { securityConfig } from '@/lib/config';
import { auditRepository } from '@/lib/db/repositories/audit.repository';
import { portalUserRepository } from '@/lib/db/repositories/portal-user.repository';
import { vendorRepository } from '@/lib/db/repositories/vendor.repository';
import { logger } from '@/lib/logger';
import { rateLimit } from '@/lib/security/rate-limit';
import { getRequestMeta, isAllowedOrigin } from '@/lib/security/request';
import { VENDOR_ROUTES } from './constants';
import { getVendorSession, requireVendorSession, vendorSessions } from './session';

/** Vendor mutations. Refused while the person is still on a temporary password. */
export const vendorAction = portalAction('vendor', () => requireVendorSession());

const loginSchema = z.object({
  email: z.email('Enter a valid email address.').max(254),
  password: z.string().min(1, 'Enter your password.').max(128),
});

const WRONG_CREDENTIALS = 'Email or password is incorrect.';

/** Verifying against a real hash when the email is unknown keeps response times the same either way. */
let decoyHash: Promise<string> | undefined;
const getDecoyHash = () => (decoyHash ??= hashPassword('decoy-password-never-matches'));

export async function vendorLogin(_previous: FormState, formData: FormData): Promise<FormState> {
  try {
    const meta = await getRequestMeta();
    if (!isAllowedOrigin(meta)) return { ok: false, message: 'This request was blocked. Reload the page.' };

    const parsed = loginSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { ok: false, message: WRONG_CREDENTIALS, fieldErrors: toFormErrors(parsed.error) };
    const email = parsed.data.email.toLowerCase();

    // Limited per IP and per account, so one address cannot be attacked from many IPs.
    const rule = securityConfig.rateLimits.adminLogin;
    const [byIp, byEmail] = await Promise.all([
      rateLimit('vendor-login-ip', meta.ip, rule),
      rateLimit('vendor-login-email', email, rule),
    ]);
    if (!byIp.success || !byEmail.success) {
      logger.warn('vendor.login_rate_limited');
      return { ok: false, message: 'Too many attempts. Wait a few minutes and try again.' };
    }

    const user = await portalUserRepository.findByEmailWithHash(email);
    const passwordOk = await verifyPassword(parsed.data.password, user?.passwordHash ?? (await getDecoyHash()));
    // A switched-off sign-in or shop gets the same answer as a wrong password.
    const vendor = user && passwordOk && user.active ? await vendorRepository.findById(user.vendorId) : null;
    if (!user || !vendor?.active) {
      logger.warn('vendor.login_failed');
      return { ok: false, message: WRONG_CREDENTIALS };
    }

    await vendorSessions.create(user.id);
    await Promise.all([
      portalUserRepository.update(user.id, { lastLoginAt: new Date() }),
      auditRepository.record({ userId: user.id, email: user.email }, 'vendor.signed_in', vendor.shopName),
    ]);
  } catch (error) {
    logger.error('vendor.login_error', {}, error);
    return { ok: false, message: 'Something went wrong. Try again.' };
  }
  redirect(VENDOR_ROUTES.dashboard);
}

export async function vendorLogout(): Promise<never> {
  const session = await getVendorSession();
  await vendorSessions.destroy();
  if (session) await auditRepository.record(session, 'vendor.signed_out', session.vendor.shopName);
  redirect(VENDOR_ROUTES.login);
}

/** The one vendor action allowed on a temporary password: replacing it. */
export const vendorChangePassword = portalAction('vendor', () =>
  requireVendorSession({ allowTemporaryPassword: true }),
)({
  name: 'vendor.change_password',
  schema: z.object({
    currentPassword: z.string().min(1, 'Enter your current password.').max(128),
    newPassword: passwordSchema,
  }),
  async handler({ currentPassword, newPassword }, session) {
    const user = await portalUserRepository.findByIdWithHash(session.userId);
    if (!user || !(await verifyPassword(currentPassword, user.passwordHash))) {
      throw new ActionError('Your current password is incorrect.');
    }
    if (currentPassword === newPassword) throw new ActionError('Choose a password you have not used here before.');
    await portalUserRepository.update(user.id, {
      passwordHash: await hashPassword(newPassword),
      mustChangePassword: false,
    });
    await vendorSessions.destroyOthers(user.id);
    await auditRepository.record(session, 'vendor.password_changed', session.vendor.shopName);
    if (session.mustChangePassword) redirect(VENDOR_ROUTES.dashboard);
    return 'Password changed. Other devices have been signed out.';
  },
});
