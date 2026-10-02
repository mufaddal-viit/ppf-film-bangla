import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getSession } from '@/lib/auth/session';

/** Reserved for phase 2 (customer accounts). Not indexed. */
export async function generateMetadata({ params }: PageProps<'/[locale]/account'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'account' });
  return { title: t('title'), robots: { index: false, follow: false } };
}

export default async function AccountPage({ params }: PageProps<'/[locale]/account'>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [session, t] = await Promise.all([getSession(), getTranslations({ locale, namespace: 'account' })]);
  return (
    <div className="c-container py-10">
      <h1 className="text-3xl font-bold">{t('title')}</h1>
      {!session && <p className="mt-3">{t('comingSoon')}</p>}
    </div>
  );
}
