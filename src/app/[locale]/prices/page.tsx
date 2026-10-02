import { SectionPage, sectionPageMetadata } from '../_lib/section-page';

export async function generateMetadata({ params }: PageProps<'/[locale]/prices'>) {
  return sectionPageMetadata('prices', (await params).locale);
}

export default async function PricesPage({ params }: PageProps<'/[locale]/prices'>) {
  return <SectionPage page="prices" locale={(await params).locale} />;
}
