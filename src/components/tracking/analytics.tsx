'use client';

import Script from 'next/script';
import { useEffect, useSyncExternalStore } from 'react';
import { Link } from '@/i18n/navigation';
import { getConsent, setConsent, subscribeConsent } from '@/lib/tracking/consent';

/**
 * Cookie consent banner and Google Tag Manager. GTM loads only after the visitor
 * accepts; until then no analytics script or cookie is set.
 */
export function Analytics({
  gtmId,
  privacyHref,
  labels,
}: {
  gtmId: string;
  privacyHref: string;
  labels: { message: string; accept: string; reject: string; learnMore: string; region: string };
}) {
  const consent = useSyncExternalStore(subscribeConsent, getConsent, () => 'denied' as const);

  useEffect(() => {
    if (consent !== 'granted') return;
    window.dataLayer ??= [];
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
  }, [consent]);

  if (consent === 'granted') {
    return (
      <Script
        id="gtm"
        src={`https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`}
        strategy="afterInteractive"
      />
    );
  }
  if (consent === 'denied') return null;

  return (
    <section
      aria-label={labels.region}
      className="c-consent-banner c-card fixed inset-x-4 bottom-20 z-40 lg:bottom-4 lg:max-w-md"
    >
      <p className="mb-3">
        {labels.message}{' '}
        <Link href={privacyHref} className="underline">
          {labels.learnMore}
        </Link>
      </p>
      <div className="flex gap-2">
        <button type="button" className="c-button" data-variant="primary" onClick={() => setConsent('granted')}>
          {labels.accept}
        </button>
        <button type="button" className="c-button" onClick={() => setConsent('denied')}>
          {labels.reject}
        </button>
      </div>
    </section>
  );
}
