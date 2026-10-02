import { LegalPage, legalPageMetadata } from '../_lib/legal-page';

export async function generateMetadata({ params }: PageProps<'/[locale]/privacy-policy'>) {
  return legalPageMetadata('privacy-policy', (await params).locale);
}

export default async function PrivacyPolicyPage({ params }: PageProps<'/[locale]/privacy-policy'>) {
  return <LegalPage doc="privacy-policy" locale={(await params).locale} />;
}
