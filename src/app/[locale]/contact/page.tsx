import { SectionPage, sectionPageMetadata } from '../_lib/section-page';

export async function generateMetadata({ params }: PageProps<'/[locale]/contact'>) {
  return sectionPageMetadata('contact', (await params).locale);
}

export default async function ContactPage({ params }: PageProps<'/[locale]/contact'>) {
  return <SectionPage page="contact" locale={(await params).locale} />;
}
