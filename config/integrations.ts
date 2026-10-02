import type { IntegrationsConfig } from '../src/lib/config/schema';

/**
 * Third-party IDs that are safe to be public. Secrets belong in env variables.
 * The Turnstile site key differs per environment, so it lives in NEXT_PUBLIC_TURNSTILE_SITE_KEY.
 */
export const integrations = {
  gtm: { enabled: false, containerId: 'GTM-XXXXXXX' },
  whatsapp: { number: '+971500000000' },
  turnstile: { enabled: true },
} satisfies IntegrationsConfig;
