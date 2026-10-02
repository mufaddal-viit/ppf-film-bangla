import { SectionPage, sectionPageMetadata } from '../_lib/section-page';

export async function generateMetadata({ params }: PageProps<'/[locale]/gallery'>) {
  return sectionPageMetadata('gallery', (await params).locale);
}

export default async function GalleryPage({ params }: PageProps<'/[locale]/gallery'>) {
  return <SectionPage page="gallery" locale={(await params).locale} />;
}
