import 'server-only';
import { unstable_rethrow } from 'next/navigation';
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

type ActionDefinition<S extends z.ZodType, Sess> = {
  name: string;
  /** Return false to refuse a signed-in user, e.g. the wrong role. */
  allow?: (session: Sess) => boolean;
  schema: S;
  handler: (data: z.output<S>, session: Sess) => Promise<string>;
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
 * Every mutation in every portal runs these steps in order:
 *   session check -> origin check -> permission check -> Zod validation -> handler -> message for the form
 * The session is verified here, not only in the page, because actions are reachable without it.
 * `portal` names the sign-in in the logs; `requireSignedIn` redirects to that portal's login page.
 */
export function portalAction<Sess extends { userId: string }>(portal: string, requireSignedIn: () => Promise<Sess>) {
  return <S extends z.ZodType>(def: ActionDefinition<S, Sess>) =>
    async (_previous: FormState, formData: FormData): Promise<FormState> => {
      const session = await requireSignedIn();
      try {
        if (!isAllowedOrigin(await getRequestMeta())) {
          logger.warn(`${portal}.forbidden_origin`, { action: def.name });
          return { ok: false, message: 'This request was blocked. Reload the page and try again.' };
        }
        if (def.allow && !def.allow(session)) {
          logger.warn(`${portal}.forbidden`, { action: def.name, userId: session.userId });
          return { ok: false, message: 'You do not have permission to do this.' };
        }
        const parsed = def.schema.safeParse(Object.fromEntries(formData));
        if (!parsed.success) {
          return { ok: false, message: 'Some fields need attention.', fieldErrors: toFormErrors(parsed.error) };
        }
        return { ok: true, message: await def.handler(parsed.data, session) };
      } catch (error) {
        // A handler may end with redirect(); that is a thrown signal, not a failure.
        unstable_rethrow(error);
        if (error instanceof ActionError) return { ok: false, message: error.message };
        logger.error(`${portal}.action_failed`, { action: def.name }, error);
        return { ok: false, message: 'Something went wrong. Try again.' };
      }
    };
}

const runAdminAction = portalAction('admin', () => requireSession());

export function adminAction<S extends z.ZodType>({ role, ...def }: AdminActionDefinition<S>) {
  return runAdminAction({ ...def, ...(role && { allow: (session: Session) => session.role === role }) });
}
