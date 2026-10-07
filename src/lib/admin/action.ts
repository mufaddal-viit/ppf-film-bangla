import 'server-only';
import type { z } from 'zod';
import { requireSession, type Session } from '@/lib/auth/session';
import { logger } from '@/lib/logger';
import { getRequestMeta, isAllowedOrigin } from '@/lib/security/request';
import type { UserRole } from './constants';
import type { FormState } from './form-state';

/** Thrown by handlers for failures the user should read, e.g. "That email is already in use." */
export class ActionError extends Error {}

type AdminActionDefinition<S extends z.ZodType> = {
  /** Log label. */
  name: string;
  /** Restrict to one role. Omit to allow every signed-in user. */
  role?: UserRole;
  schema: S;
  /** Returns the success message shown under the form. */
  handler: (data: z.output<S>, session: Session) => Promise<string>;
};

export function toFormErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? 'form');
    errors[field] ??= issue.message;
  }
  return errors;
}

/**
 * Every admin mutation runs these steps in order:
 *   session check -> origin check -> role check -> Zod validation -> handler -> message for the form
 * The session is verified here, not only in the page, because actions are reachable without it.
 */
export function adminAction<S extends z.ZodType>(def: AdminActionDefinition<S>) {
  return async (_previous: FormState, formData: FormData): Promise<FormState> => {
    const session = await requireSession();
    try {
      if (!isAllowedOrigin(await getRequestMeta())) {
        logger.warn('admin.forbidden_origin', { action: def.name });
        return { ok: false, message: 'This request was blocked. Reload the page and try again.' };
      }
      if (def.role && session.role !== def.role) {
        logger.warn('admin.forbidden_role', { action: def.name, userId: session.userId });
        return { ok: false, message: 'You do not have permission to do this.' };
      }
      const parsed = def.schema.safeParse(Object.fromEntries(formData));
      if (!parsed.success) {
        return { ok: false, message: 'Some fields need attention.', fieldErrors: toFormErrors(parsed.error) };
      }
      return { ok: true, message: await def.handler(parsed.data, session) };
    } catch (error) {
      if (error instanceof ActionError) return { ok: false, message: error.message };
      logger.error('admin.action_failed', { action: def.name }, error);
      return { ok: false, message: 'Something went wrong. Try again.' };
    }
  };
}
