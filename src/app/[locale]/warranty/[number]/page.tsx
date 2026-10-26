import { Download, ShieldCheck, ShieldOff, ShieldAlert } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { siteConfig } from '@/lib/config';
import { customerRepository } from '@/lib/db/repositories/customer.repository';
import { installationRepository } from '@/lib/db/repositories/installation.repository';
import { productRepository } from '@/lib/db/repositories/product.repository';
import { vendorRepository } from '@/lib/db/repositories/vendor.repository';

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps<'/[locale]/warranty/[number]'>): Promise<Metadata> {
  const { number } = await params;
  return {
    title: `Warranty ${number} — ${siteConfig.business.name}`,
    robots: { index: false, follow: false },
  };
}

const FORMAT_DATE = new Intl.DateTimeFormat('en-GB', { dateStyle: 'long' });

export default async function WarrantyLookupPage({ params }: PageProps<'/[locale]/warranty/[number]'>) {
  const { locale, number } = await params;
  setRequestLocale(locale);

  const installation = await installationRepository.findByWarrantyNumber(number);
  if (!installation) notFound();

  const [customer, product, vendor] = await Promise.all([
    customerRepository.findById(installation.customerId),
    productRepository.findById(installation.productId),
    vendorRepository.findById(installation.vendorId),
  ]);

  const vehicle = customer?.vehicles.find((v) => v.id === installation.vehicleId) ?? null;
  const now = new Date();
  const isVoided = !!installation.voidedAt;
  const isExpired = !isVoided && installation.warrantyExpiresAt < now;
  const StatusIcon = isVoided ? ShieldOff : isExpired ? ShieldAlert : ShieldCheck;
  const statusLabel = isVoided ? 'Voided' : isExpired ? 'Expired' : 'Valid';
  const statusClass = isVoided ? 'text-danger' : isExpired ? 'text-warning' : 'text-success';

  return (
    <div className="c-container py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <StatusIcon className={`mx-auto mb-3 h-16 w-16 ${statusClass}`} aria-hidden="true" />
          <h1 className="text-3xl font-bold">{installation.warrantyNumber}</h1>
          <p className={`mt-2 text-lg font-semibold ${statusClass}`}>{statusLabel}</p>
        </div>

        <div className="c-card divide-y divide-border">
          <dl className="c-warranty-details">
            {customer && (
              <div className="c-warranty-row">
                <dt>Customer</dt>
                <dd>{customer.name}</dd>
              </div>
            )}
            {vehicle && (
              <div className="c-warranty-row">
                <dt>Vehicle</dt>
                <dd>
                  {[vehicle.make, vehicle.model, vehicle.year].filter(Boolean).join(' ')}
                  {vehicle.plate && <span className="ml-2 text-muted-foreground">({vehicle.plate})</span>}
                </dd>
              </div>
            )}
            {product && (
              <>
                <div className="c-warranty-row">
                  <dt>Product</dt>
                  <dd>
                    {product.name} ({product.finish})
                  </dd>
                </div>
                <div className="c-warranty-row">
                  <dt>Warranty period</dt>
                  <dd>
                    {product.warrantyYears} {product.warrantyYears === 1 ? 'year' : 'years'}
                  </dd>
                </div>
              </>
            )}
            <div className="c-warranty-row">
              <dt>Area protected</dt>
              <dd>{installation.area}</dd>
            </div>
            <div className="c-warranty-row">
              <dt>Installation date</dt>
              <dd>{FORMAT_DATE.format(installation.installedAt)}</dd>
            </div>
            <div className="c-warranty-row">
              <dt>Warranty expires</dt>
              <dd>{FORMAT_DATE.format(installation.warrantyExpiresAt)}</dd>
            </div>
            <div className="c-warranty-row">
              <dt>Installer</dt>
              <dd>{installation.installer}</dd>
            </div>
            {vendor && (
              <div className="c-warranty-row">
                <dt>Installation shop</dt>
                <dd>{vendor.shopName}</dd>
              </div>
            )}
            {isVoided && installation.voidReason && (
              <div className="c-warranty-row">
                <dt>Void reason</dt>
                <dd className="text-danger">{installation.voidReason}</dd>
              </div>
            )}
          </dl>
        </div>

        {!isVoided && (
          <div className="mt-6 text-center">
            <a
              href={`/api/warranty/${encodeURIComponent(installation.warrantyNumber)}/pdf`}
              className="c-button inline-flex items-center gap-2"
              data-variant="primary"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Download warranty card (PDF)
            </a>
          </div>
        )}

        <p className="mt-8 text-center text-sm text-muted-foreground">
          This warranty was issued by {siteConfig.business.name}.
          {siteConfig.contact.phone && (
            <>
              {' '}
              Contact us at{' '}
              <a href={`tel:${siteConfig.contact.phone}`} className="underline" dir="ltr">
                {siteConfig.contact.phone}
              </a>{' '}
              for questions.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
