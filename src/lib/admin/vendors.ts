import 'server-only';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { generateTempPassword, hashPassword } from '@/lib/auth/password';
import { siteConfig } from '@/lib/config';
import { auditRepository } from '@/lib/db/repositories/audit.repository';
import { portalUserRepository } from '@/lib/db/repositories/portal-user.repository';
import { sessionRepository } from '@/lib/db/repositories/session.repository';
import { isDuplicateKeyError } from '@/lib/db/repositories/user.repository';
import { vendorRepository } from '@/lib/db/repositories/vendor.repository';
import { normalizePhone } from '@/lib/validation/lead';
import { ActionError, adminAction } from './action';
import { ADMIN_ROUTES } from './constants';

const idSchema = z.string().regex(/^[0-9a-f]{24}$/);
const MAX_INSTALLERS = 30;

const checkbox = z
  .string()
  .optional()
  .transform((value) => value === 'on');

/** One installer per line -> trimmed, de-duplicated names. */
export function parseInstallers(input: string): string[] {
  const names = input
    .split(/\r?\n/)
    .map((name) => name.trim().replace(/\s+/g, ' '))
    .filter(Boolean);
  return [...new Map(names.map((name) => [name.toLowerCase(), name])).values()];
}

export const vendorFormSchema = z.object({
  shopName: z.string().trim().min(2, 'Enter the shop name.').max(100),
  contactName: z.string().trim().min(2, 'Enter the contact person.').max(100),
  email: z.email('Enter a valid email address.').max(254),
  phone: z
    .string()
    .trim()
    .max(30)
    .transform((value, ctx) => {
      const e164 = normalizePhone(value, siteConfig.locale.phoneRegion);
      if (!e164) {
        ctx.addIssue({ code: 'custom', message: 'Enter a valid phone number with the country code, like +971…' });
        return z.NEVER;
      }
      return e164;
    }),
  address: z.string().trim().min(5, 'Enter the shop address.').max(300),
  installers: z
    .string()
    .max(2000)
    .transform(parseInstallers)
    .refine((names) => names.length <= MAX_INSTALLERS, `List at most ${MAX_INSTALLERS} installers.`)
    .refine((names) => names.every((name) => name.length <= 100), 'An installer name is too long.'),
});

const vendorPath = (id: string) => `${ADMIN_ROUTES.vendors}/${id}`;

function refresh(id?: string) {
  revalidatePath(ADMIN_ROUTES.vendors);
  if (id) revalidatePath(vendorPath(id));
}

/** Signs out every person at a vendor, used when the shop or a sign-in is switched off. */
async function signOutVendor(vendorId: string) {
  const users = await portalUserRepository.listForVendor(vendorId);
  await sessionRepository.deleteForUsers(users.map((user) => user.id));
}

export const createVendor = adminAction({
  name: 'vendor.create',
  role: 'owner',
  schema: vendorFormSchema,
  async handler(input, session) {
    const { id } = await vendorRepository.create(input);
    await auditRepository.record(session, 'vendor.created', input.shopName);
    refresh();
    redirect(`${vendorPath(id)}?created=1`);
  },
});

export const updateVendor = adminAction({
  name: 'vendor.update',
  role: 'owner',
  schema: vendorFormSchema.extend({ id: idSchema, active: checkbox }),
  async handler({ id, ...input }, session) {
    if (!(await vendorRepository.update(id, input))) throw new ActionError('That vendor no longer exists.');
    if (!input.active) await signOutVendor(id);
    await auditRepository.record(session, 'vendor.updated', input.shopName, input.active ? 'active' : 'deactivated');
    refresh(id);
    return input.active ? 'Saved.' : 'Saved. Everyone at this shop has been signed out.';
  },
});

/**
 * Creates a vendor sign-in with a random temporary password. The password is returned once in the
 * form message and never stored or logged; the person must replace it at first sign-in.
 */
export const createVendorLogin = adminAction({
  name: 'vendor.login_create',
  role: 'owner',
  schema: z.object({
    vendorId: idSchema,
    name: z.string().trim().min(2, 'Enter the person’s name.').max(100),
    email: z.email('Enter a valid email address.').max(254),
  }),
  async handler({ vendorId, name, email }, session) {
    const vendor = await vendorRepository.findById(vendorId);
    if (!vendor) throw new ActionError('That vendor no longer exists.');
    const password = generateTempPassword();
    try {
      await portalUserRepository.create({ vendorId, name, email, passwordHash: await hashPassword(password) });
    } catch (error) {
      if (isDuplicateKeyError(error)) throw new ActionError('That email already has a vendor sign-in.');
      throw error;
    }
    await auditRepository.record(session, 'vendor.login_created', email.toLowerCase(), vendor.shopName);
    refresh(vendorId);
    return `Sign-in created for ${name}. Temporary password: ${password} — it is shown only now, so pass it on privately.`;
  },
});

export const resetVendorLoginPassword = adminAction({
  name: 'vendor.login_reset',
  role: 'owner',
  schema: z.object({ id: idSchema }),
  async handler({ id }, session) {
    const user = await portalUserRepository.findById(id);
    if (!user) throw new ActionError('That sign-in no longer exists.');
    const password = generateTempPassword();
    await portalUserRepository.update(id, { passwordHash: await hashPassword(password), mustChangePassword: true });
    await sessionRepository.deleteForUsers([id]);
    await auditRepository.record(session, 'vendor.login_reset', user.email);
    refresh(user.vendorId);
    return `New temporary password for ${user.name}: ${password} — it is shown only now.`;
  },
});

export const setVendorLoginActive = adminAction({
  name: 'vendor.login_set_active',
  role: 'owner',
  schema: z.object({ id: idSchema, active: z.enum(['true', 'false']).transform((value) => value === 'true') }),
  async handler({ id, active }, session) {
    const user = await portalUserRepository.findById(id);
    if (!user) throw new ActionError('That sign-in no longer exists.');
    await portalUserRepository.update(id, { active });
    if (!active) await sessionRepository.deleteForUsers([id]);
    await auditRepository.record(session, 'vendor.login_updated', user.email, active ? 'active' : 'deactivated');
    refresh(user.vendorId);
    return active ? `${user.name} can sign in again.` : `${user.name} can no longer sign in.`;
  },
});
