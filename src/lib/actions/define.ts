import 'server-only';
import { integrationsConfig } from '@/lib/config';
import { rateLimit } from '@/lib/security/rate-limit';
import { getRequestMeta, isAllowedOrigin } from '@/lib/security/request';
import { verifyTurnstile } from '@/lib/security/turnstile';
import { createActionPipeline } from './pipeline';

/** The pipeline wired to real infrastructure. Use this to define every server action. */
export const defineAction = createActionPipeline({
  getRequestMeta,
  isAllowedOrigin,
  rateLimit,
  verifyTurnstile: integrationsConfig.turnstile.enabled ? verifyTurnstile : null,
});
