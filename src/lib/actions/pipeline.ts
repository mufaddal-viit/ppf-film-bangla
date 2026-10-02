/**
 * The one mutation pipeline. Every server action runs these steps in order:
 *   origin check -> rate limit -> honeypot + Turnstile -> Zod validation -> handler -> typed result
 * Dependencies are injected so the pipeline is unit-testable without Next.js.
 */
import { z } from 'zod';
import { fail, type ActionResult } from '@/lib/errors';
import { logger } from '@/lib/logger';
import type { RateLimiter, RateLimitRule } from '@/lib/security/rate-limit';
import type { RequestMeta } from '@/lib/security/request';
import { toFieldErrors } from '@/lib/validation/lead';

export type PipelineDeps = {
  getRequestMeta: () => Promise<RequestMeta>;
  isAllowedOrigin: (meta: RequestMeta) => boolean;
  rateLimit: RateLimiter;
  /** null when Turnstile is disabled in config/integrations.ts */
  verifyTurnstile: ((token: string | undefined, ip: string) => Promise<boolean>) | null;
};

type ActionDefinition<S extends z.ZodType, R> = {
  /** Rate-limit bucket and log label. */
  name: string;
  rateLimit: RateLimitRule;
  schema: S;
  handler: (data: z.output<S>) => Promise<R>;
  /** Returned to bots that fill the honeypot, so they cannot tell they were caught. */
  decoy: R;
};

/** What the client sends: the form payload plus anti-bot fields kept out of the business schema. */
export const actionEnvelopeSchema = z.object({
  payload: z.unknown(),
  security: z.object({
    turnstileToken: z.string().max(4096).optional(),
    honeypot: z.string().max(500).optional(),
  }),
});
export type ActionEnvelope = z.input<typeof actionEnvelopeSchema>;

export function createActionPipeline(deps: PipelineDeps) {
  return function defineAction<S extends z.ZodType, R>(def: ActionDefinition<S, R>) {
    return async (input: unknown): Promise<ActionResult<R>> => {
      try {
        const meta = await deps.getRequestMeta();
        if (!deps.isAllowedOrigin(meta)) {
          logger.warn('action.forbidden_origin', { action: def.name });
          return fail('FORBIDDEN');
        }

        const { success } = await deps.rateLimit(def.name, meta.ip, def.rateLimit);
        if (!success) {
          logger.warn('action.rate_limited', { action: def.name });
          return fail('RATE_LIMITED');
        }

        const envelope = actionEnvelopeSchema.safeParse(input);
        if (!envelope.success) return fail('VALIDATION_FAILED');
        const { security, payload } = envelope.data;

        if (security.honeypot) {
          logger.warn('action.honeypot', { action: def.name });
          return { ok: true, data: def.decoy };
        }
        if (deps.verifyTurnstile && !(await deps.verifyTurnstile(security.turnstileToken, meta.ip))) {
          return fail('BOT_CHECK_FAILED');
        }

        const parsed = def.schema.safeParse(payload);
        if (!parsed.success) return fail('VALIDATION_FAILED', toFieldErrors(parsed.error));

        return { ok: true, data: await def.handler(parsed.data) };
      } catch (error) {
        logger.error('action.failed', { action: def.name }, error);
        return fail('INTERNAL');
      }
    };
  };
}
