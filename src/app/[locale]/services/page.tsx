import { SectionPage, sectionPageMetadata } from '../_lib/section-page';

export async function generateMetadata({ params }: PageProps<'/[locale]/services'>) {
  return sectionPageMetadata('services', (await params).locale);
}

export default async function ServicesPage({ params }: PageProps<'/[locale]/services'>) {
  return <SectionPage page="services" locale={(await params).locale} />;
}
