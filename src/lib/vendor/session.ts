import 'server-only';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { sessionStore } from '@/lib/auth/session';
import { portalUserRepository } from '@/lib/db/repositories/portal-user.repository';
import { vendorRepository, type Vendor } from '@/lib/db/repositories/vendor.repository';
import { VENDOR_ROUTES, VENDOR_SESSION_COOKIE } from './constants';

export type VendorSession = {
  userId: string;
  email: string;
  name: string;
  /** The shop this person belongs to. Every vendor query is filtered by this id, never by one from the page. */
  vendorId: string;
  vendor: Vendor;
  mustChangePassword: boolean;
};

/** The cookie is scoped to /vendor, so it is never sent to the admin panel or the public site. */
export const vendorSessions = sessionStore({
  scope: 'vendor',
  cookie: VENDOR_SESSION_COOKIE,
  path: VENDOR_ROUTES.dashboard,
});

/**
 * The signed-in vendor user, or null (looked up once per render). Both the sign-in and the shop must
 * be active, so switching off a vendor locks every one of its people out on their next request.
 */
export const getVendorSession = cache(async (): Promise<VendorSession | null> => {
  const userId = await vendorSessions.currentUserId();
  if (!userId) return null;
  const user = await portalUserRepository.findById(userId);
  if (!user?.active) return null;
  const vendor = await vendorRepository.findById(user.vendorId);
  if (!vendor?.active) return null;
  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    vendorId: vendor.id,
    vendor,
    mustChangePassword: user.mustChangePassword,
  };
});

/**
 * For pages and actions: sends signed-out visitors to the vendor login page. Someone still on a
 * temporary password is sent to the account page until they replace it, unless `allowTemporaryPassword`.
 */
export async function requireVendorSession(options?: { allowTemporaryPassword?: boolean }): Promise<VendorSession> {
  const session = await getVendorSession();
  if (!session) redirect(VENDOR_ROUTES.login);
  if (session.mustChangePassword && !options?.allowTemporaryPassword) redirect(VENDOR_ROUTES.account);
  return session;
}
