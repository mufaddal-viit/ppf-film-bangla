import 'client-only';
import type { LeadContext } from '@/lib/validation/lead';

type Attribution = Pick<LeadContext, 'landingPage' | 'referrer' | 'utm'>;

const KEY = 'ppf.attribution.v1';
const UTM_KEYS = ['source', 'medium', 'campaign', 'term', 'content'] as const;
const clip = (value: string) => value.slice(0, 100);

/**
 * First-touch attribution: stores the landing page, external referrer and UTM parameters
 * from the first visit so they can be attached to a lead submitted later.
 */
export function captureAttribution(): void {
  try {
    if (localStorage.getItem(KEY)) return;
    const params = new URLSearchParams(window.location.search);
    const utm: NonNullable<Attribution['utm']> = {};
    for (const key of UTM_KEYS) {
      const value = params.get(`utm_${key}`);
      if (value) utm[key] = clip(value);
    }
    const referrer =
      document.referrer && new URL(document.referrer).host !== window.location.host ? document.referrer : undefined;
    const attribution: Attribution = {
      landingPage: window.location.pathname.slice(0, 500),
      ...(referrer && { referrer: referrer.slice(0, 500) }),
      ...(Object.keys(utm).length > 0 && { utm }),
    };
    localStorage.setItem(KEY, JSON.stringify(attribution));
  } catch {
    // Storage blocked: the lead is still accepted without attribution.
  }
}

export function getAttribution(): Attribution {
  try {
    const stored = localStorage.getItem(KEY);
    return stored ? (JSON.parse(stored) as Attribution) : {};
  } catch {
    return {};
  }
}
