import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { SectionList } from '@/components/sections/registry';
import { getPageCopy, getPageSections, getSectionData } from '@/lib/content';
import { buildMetadata } from '@/lib/seo/metadata';

export async function generateMetadata({ params }: PageProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await params;
  const copy = await getPageCopy('home', locale);
  return buildMetadata({ locale, path: '/', title: copy.seo.title, description: copy.seo.description });
}

/** Homepage: entirely driven by the section list in config/pages.ts. */
export default async function HomePage({ params }: PageProps<'/[locale]'>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [sections, data] = await Promise.all([getPageSections('home', locale), getSectionData(locale, 'home')]);
  return <SectionList sections={sections} data={data} />;
}
