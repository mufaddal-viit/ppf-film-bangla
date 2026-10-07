import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

/** Reserved for customer accounts. Not indexed. Staff sign in at /admin instead. */
export async function generateMetadata({ params }: PageProps<'/[locale]/account'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'account' });
  return { title: t('title'), robots: { index: false, follow: false } };
}

export default async function AccountPage({ params }: PageProps<'/[locale]/account'>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'account' });
  return (
    <div className="c-container py-10">
      <h1 className="text-3xl font-bold">{t('title')}</h1>
      <p className="mt-3">{t('comingSoon')}</p>
    </div>
  );
}
