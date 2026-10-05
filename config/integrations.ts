import type { IntegrationsConfig } from '../src/lib/config/schema';

/**
 * Third-party IDs that are safe to be public. Secrets belong in env variables.
 * The Turnstile site key differs per environment, so it lives in NEXT_PUBLIC_TURNSTILE_SITE_KEY.
 */
export const integrations = {
  gtm: { enabled: false, containerId: 'GTM-XXXXXXX' },
  // Fossil lists no WhatsApp number, so WhatsApp links are off; the number only satisfies the schema.
  whatsapp: { enabled: false, number: '+15752551211' },
  turnstile: { enabled: true },
} satisfies IntegrationsConfig;
