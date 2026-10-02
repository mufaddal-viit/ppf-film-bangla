import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHeader } from '@/components/layout/page-header';
import { SectionList } from '@/components/sections/registry';
import type { PageKey } from '@/lib/config/schema';
import { getPageCopy, getPageSections, getSectionData, ROUTES } from '@/lib/content';
import { buildBreadcrumbs, buildMetadata } from '@/lib/seo/metadata';

type SectionPageKey = Exclude<PageKey, 'home'>;

/** Metadata for a page whose body is a config-driven list of sections. */
export async function sectionPageMetadata(page: SectionPageKey, locale: string): Promise<Metadata> {
  const copy = await getPageCopy(page, locale);
  return buildMetadata({ locale, path: ROUTES[page], title: copy.seo.title, description: copy.seo.description });
}

/** Page header (the <h1>) followed by the sections configured in config/pages.ts. */
export async function SectionPage({ page, locale }: { page: SectionPageKey; locale: string }) {
  setRequestLocale(locale);
  const [copy, sections, data, t] = await Promise.all([
    getPageCopy(page, locale),
    getPageSections(page, locale),
    getSectionData(locale, page),
    getTranslations({ locale }),
  ]);
  return (
    <>
      <PageHeader
        title={copy.title}
        intro={copy.intro}
        breadcrumbLabel={t('a11y.breadcrumb')}
        breadcrumbs={buildBreadcrumbs(locale, t('nav.home'), [{ name: copy.title, path: ROUTES[page] }])}
      />
      <SectionList sections={sections} data={data} />
    </>
  );
}
