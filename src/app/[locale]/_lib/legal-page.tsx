import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHeader } from '@/components/layout/page-header';
import { getPageCopy, ROUTES } from '@/lib/content';
import { getLegalDocument, type LegalDocument } from '@/lib/content/mdx';
import { buildBreadcrumbs, buildMetadata } from '@/lib/seo/metadata';

const PAGES = {
  'privacy-policy': { copy: 'privacyPolicy', path: ROUTES.privacyPolicy },
  terms: { copy: 'terms', path: ROUTES.terms },
} as const;

export async function legalPageMetadata(doc: LegalDocument, locale: string): Promise<Metadata> {
  const copy = await getPageCopy(PAGES[doc].copy, locale);
  return buildMetadata({ locale, path: PAGES[doc].path, title: copy.seo.title, description: copy.seo.description });
}

export async function LegalPage({ doc, locale }: { doc: LegalDocument; locale: string }) {
  setRequestLocale(locale);
  const [copy, Content, t] = await Promise.all([
    getPageCopy(PAGES[doc].copy, locale),
    getLegalDocument(locale, doc),
    getTranslations({ locale }),
  ]);
  return (
    <>
      <PageHeader
        title={copy.title}
        breadcrumbLabel={t('a11y.breadcrumb')}
        breadcrumbs={buildBreadcrumbs(locale, t('nav.home'), [{ name: copy.title, path: PAGES[doc].path }])}
      />
      <div className="c-container c-prose">
        <Content />
      </div>
    </>
  );
}
