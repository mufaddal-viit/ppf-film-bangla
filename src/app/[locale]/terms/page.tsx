import { LegalPage, legalPageMetadata } from '../_lib/legal-page';

export async function generateMetadata({ params }: PageProps<'/[locale]/terms'>) {
  return legalPageMetadata('terms', (await params).locale);
}

export default async function TermsPage({ params }: PageProps<'/[locale]/terms'>) {
  return <LegalPage doc="terms" locale={(await params).locale} />;
}
