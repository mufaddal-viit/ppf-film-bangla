/**
 * Security headers for every response, built from config. Imported by next.config.ts,
 * so this file uses relative imports only.
 *
 * CSP has no nonces on purpose: nonces force every page to render per request, which
 * disables static generation and ISR. Next.js inlines its own bootstrap scripts, so
 * script-src needs 'unsafe-inline'; external scripts are still limited to the hosts below.
 */
import { integrationsConfig, securityConfig } from '../config';

const GTM = {
  script: ['https://www.googletagmanager.com'],
  connect: ['https://www.google-analytics.com', 'https://*.analytics.google.com', 'https://www.googletagmanager.com'],
  img: ['https://www.google-analytics.com', 'https://www.googletagmanager.com'],
};
const TURNSTILE = 'https://challenges.cloudflare.com';
const GOOGLE_MAPS = 'https://www.google.com';

type HeaderOptions = { isDev: boolean; https: boolean };

function buildCsp({ isDev, https }: HeaderOptions): string {
  const { csp } = securityConfig;
  const gtm = integrationsConfig.gtm.enabled;
  const turnstile = integrationsConfig.turnstile.enabled;

  const directives: Record<string, string[]> = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-inline'",
      ...(isDev ? ["'unsafe-eval'"] : []),
      ...(gtm ? GTM.script : []),
      ...(turnstile ? [TURNSTILE] : []),
      ...csp.extraScriptSrc,
    ],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'blob:', ...(gtm ? GTM.img : []), ...csp.extraImgSrc],
    'font-src': ["'self'"],
    'connect-src': ["'self'", ...(gtm ? GTM.connect : []), ...(turnstile ? [TURNSTILE] : []), ...csp.extraConnectSrc],
    'frame-src': [...(turnstile ? [TURNSTILE] : []), GOOGLE_MAPS, ...csp.extraFrameSrc],
    'media-src': ["'self'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
  };
  const policy = Object.entries(directives).map(([name, values]) => `${name} ${values.join(' ')}`);
  if (https) policy.push('upgrade-insecure-requests');
  return policy.join('; ');
}

/** `https` is false for local http:// testing (e.g. Lighthouse CI against `next start`). */
export function securityHeaders(options: HeaderOptions): Array<{ key: string; value: string }> {
  return [
    { key: 'Content-Security-Policy', value: buildCsp(options) },
    ...(options.https
      ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }]
      : []),
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    {
      key: 'Permissions-Policy',
      value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=(), browsing-topics=()',
    },
    { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  ];
}
