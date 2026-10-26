import { ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { WarrantySearchForm } from '@/components/warranty/search-form';
import { siteConfig } from '@/lib/config';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Verify warranty — ${siteConfig.business.name}`,
    description: `Look up a ${siteConfig.business.name} warranty card by its number to check product, coverage and expiry.`,
  };
}

export default async function WarrantyPage({ params }: PageProps<'/[locale]/warranty'>) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="c-container py-10">
      <div className="mx-auto max-w-md text-center">
        <ShieldCheck className="mx-auto mb-4 h-12 w-12 text-primary" aria-hidden="true" />
        <h1 className="text-3xl font-bold">Verify warranty</h1>
        <p className="mt-3 text-muted-foreground">
          Enter a warranty number to check the product, coverage dates and installation details.
        </p>
        <WarrantySearchForm locale={locale} className="mt-8" />
      </div>
    </div>
  );
}
