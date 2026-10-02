import 'client-only';

type ConsentState = 'granted' | 'denied' | 'unset';

const KEY = 'ppf.consent.analytics.v1';
const EVENT = 'ppf:consent-change';

export function getConsent(): ConsentState {
  try {
    const value = localStorage.getItem(KEY);
    return value === 'granted' || value === 'denied' ? value : 'unset';
  } catch {
    return 'unset';
  }
}

export function setConsent(value: Exclude<ConsentState, 'unset'>): void {
  try {
    localStorage.setItem(KEY, value);
  } catch {
    // Storage blocked: consent applies to this page view only.
  }
  window.dispatchEvent(new CustomEvent(EVENT));
}

/** For useSyncExternalStore. */
export function subscribeConsent(callback: () => void): () => void {
  window.addEventListener(EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}
