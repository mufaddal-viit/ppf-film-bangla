'use client';

import { useTranslations } from 'next-intl';

/** Error boundary for page content. Errors are logged server-side; nothing internal is shown. */
export default function ErrorPage({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const t = useTranslations('error');
  return (
    <div role="alert" className="c-container py-16">
      <h1 className="text-3xl font-bold">{t('title')}</h1>
      <p className="mt-3">{t('body')}</p>
      <button type="button" className="c-button mt-6" data-variant="primary" onClick={() => retry()}>
        {t('retry')}
      </button>
    </div>
  );
}
