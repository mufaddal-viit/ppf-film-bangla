import 'server-only';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { hashPassword } from '@/lib/auth/password';
import { auditRepository } from '@/lib/db/repositories/audit.repository';
import { sessionRepository } from '@/lib/db/repositories/session.repository';
import { isDuplicateKeyError, userRepository } from '@/lib/db/repositories/user.repository';
import { ActionError, adminAction } from './action';
import { passwordSchema } from './auth';
import { ADMIN_ROUTES, USER_ROLES } from './constants';

const nameSchema = z.string().trim().min(2, 'Enter a name.').max(100);
const roleSchema = z.enum(USER_ROLES, 'Choose a role.');
const idSchema = z.string().regex(/^[0-9a-f]{24}$/);

export const createUser = adminAction({
  name: 'user.create',
  role: 'owner',
  schema: z.object({
    name: nameSchema,
    email: z.email('Enter a valid email address.').max(254),
    role: roleSchema,
    password: passwordSchema,
  }),
  async handler({ name, email, role, password }, session) {
    try {
      await userRepository.create({ name, email, role, passwordHash: await hashPassword(password) });
    } catch (error) {
      if (isDuplicateKeyError(error)) throw new ActionError('A user with that email already exists.');
      throw error;
    }
    await auditRepository.record(session, 'user.created', email.toLowerCase(), role);
    revalidatePath(ADMIN_ROUTES.users);
    return `${name} can now sign in.`;
  },
});

export const updateUser = adminAction({
  name: 'user.update',
  role: 'owner',
  schema: z.object({
    id: idSchema,
    name: nameSchema,
    role: roleSchema,
    // A checkbox: present ("on") when ticked, missing when not.
    active: z
      .string()
      .optional()
      .transform((value) => value === 'on'),
  }),
  async handler({ id, name, role, active }, session) {
    const user = await userRepository.findById(id);
    if (!user) throw new ActionError('That user no longer exists.');

    const losesOwner = user.role === 'owner' && user.active && (role !== 'owner' || !active);
    if (losesOwner && id === session.userId) {
      throw new ActionError('You cannot remove your own owner access.');
    }
    if (losesOwner && (await userRepository.countActiveOwners()) <= 1) {
      throw new ActionError('At least one active owner is required.');
    }

    await userRepository.update(id, { name, role, active });
    if (!active) await sessionRepository.deleteForUser(id);
    await auditRepository.record(session, 'user.updated', user.email, `${role}, ${active ? 'active' : 'deactivated'}`);
    revalidatePath(ADMIN_ROUTES.users);
    return 'Saved.';
  },
});

export const resetUserPassword = adminAction({
  name: 'user.reset_password',
  role: 'owner',
  schema: z.object({ id: idSchema, password: passwordSchema }),
  async handler({ id, password }, session) {
    const user = await userRepository.findById(id);
    if (!user) throw new ActionError('That user no longer exists.');
    await userRepository.update(id, { passwordHash: await hashPassword(password) });
    // Signs the user out everywhere, except the owner's own current session.
    if (id !== session.userId) await sessionRepository.deleteForUser(id);
    await auditRepository.record(session, 'user.password_reset', user.email);
    return `New password set for ${user.name}. Share it with them privately.`;
  },
});
