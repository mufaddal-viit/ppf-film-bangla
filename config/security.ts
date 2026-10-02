import type { SecurityConfig } from '../src/lib/config/schema';

export const security = {
  /** Per IP, per endpoint. */
  rateLimits: {
    quote: { requests: 5, windowSeconds: 600 },
    contact: { requests: 5, windowSeconds: 600 },
    callback: { requests: 3, windowSeconds: 600 },
  },
  /** Hosts added on top of the defaults built in src/lib/security/csp.ts. */
  csp: {
    extraScriptSrc: [],
    extraConnectSrc: [],
    extraImgSrc: [],
    extraFrameSrc: [],
  },
} satisfies SecurityConfig;
