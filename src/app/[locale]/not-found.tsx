import { getLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getPageCopy } from '@/lib/content';

export default async function NotFoundPage() {
  const locale = await getLocale();
  const [copy, t] = await Promise.all([
    getPageCopy('notFound', locale),
    getTranslations({ locale, namespace: 'notFound' }),
  ]);
  return (
    <div className="c-container py-16">
      <title>{copy.seo.title}</title>
      <meta name="robots" content="noindex" />
      <h1 className="text-3xl font-bold">{copy.title}</h1>
      {copy.intro && <p className="mt-3">{copy.intro}</p>}
      <Link href="/" className="c-button mt-6" data-variant="primary">
        {t('home')}
      </Link>
    </div>
  );
}
