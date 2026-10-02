'use client';

import Script from 'next/script';
import { useCallback, useEffect, useImperativeHandle, useRef, useState, type Ref } from 'react';

type TurnstileApi = {
  render: (
    el: HTMLElement,
    options: {
      sitekey: string;
      language?: string;
      callback: (token: string) => void;
      'expired-callback': () => void;
      'error-callback': () => void;
    },
  ) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export type TurnstileHandle = { reset: () => void };

/** Cloudflare Turnstile widget, rendered explicitly so it works with client-side navigation. */
export function Turnstile({
  siteKey,
  locale,
  onToken,
  ref,
}: {
  siteKey: string;
  locale: string;
  onToken: (token: string | undefined) => void;
  ref?: Ref<TurnstileHandle>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const [ready, setReady] = useState(() => typeof window !== 'undefined' && Boolean(window.turnstile));
  const onTokenRef = useRef(onToken);
  useEffect(() => {
    onTokenRef.current = onToken;
  });

  useEffect(() => {
    if (!ready || !containerRef.current || !window.turnstile) return;
    const api = window.turnstile;
    widgetId.current = api.render(containerRef.current, {
      sitekey: siteKey,
      language: locale,
      callback: (token) => onTokenRef.current(token),
      'expired-callback': () => onTokenRef.current(undefined),
      'error-callback': () => onTokenRef.current(undefined),
    });
    return () => {
      if (widgetId.current) api.remove(widgetId.current);
      widgetId.current = null;
    };
  }, [ready, siteKey, locale]);

  const reset = useCallback(() => {
    if (widgetId.current) window.turnstile?.reset(widgetId.current);
    onTokenRef.current(undefined);
  }, []);
  useImperativeHandle(ref, () => ({ reset }), [reset]);

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => setReady(true)}
      />
      <div ref={containerRef} className="c-turnstile" />
    </>
  );
}
