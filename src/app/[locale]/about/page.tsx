import { SectionPage, sectionPageMetadata } from '../_lib/section-page';

export async function generateMetadata({ params }: PageProps<'/[locale]/about'>) {
  return sectionPageMetadata('about', (await params).locale);
}

export default async function AboutPage({ params }: PageProps<'/[locale]/about'>) {
  return <SectionPage page="about" locale={(await params).locale} />;
}
