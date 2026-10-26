import { Download } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { voidInstallation } from '@/app/actions/admin';
import { AdminForm } from '@/components/admin/admin-form';
import { Field, PageHead, Panel, Pill } from '@/components/admin/ui';
import { ADMIN_ROUTES } from '@/lib/admin/constants';
import { adminDates, metres } from '@/lib/admin/format';
import { requireSession } from '@/lib/auth/session';
import { siteConfig } from '@/lib/config';
import { customerRepository } from '@/lib/db/repositories/customer.repository';
import { installationRepository } from '@/lib/db/repositories/installation.repository';
import { productRepository } from '@/lib/db/repositories/product.repository';
import { rollRepository } from '@/lib/db/repositories/roll.repository';
import { vendorRepository } from '@/lib/db/repositories/vendor.repository';

export const metadata: Metadata = { title: 'Installation' };

export default async function AdminInstallationPage({ params }: PageProps<'/admin/installations/[id]'>) {
  await requireSession('owner');
  const { id } = await params;
  const installation = await installationRepository.findById(id);
  if (!installation) notFound();

  const [customer, product, vendor, roll] = await Promise.all([
    customerRepository.findById(installation.customerId),
    productRepository.findById(installation.productId),
    vendorRepository.findById(installation.vendorId),
    rollRepository.findById(installation.rollId),
  ]);
  const format = adminDates(siteConfig.locale.timezone);

  const vehicle = customer?.vehicles.find((v) => v.id === installation.vehicleId);
  const now = new Date();
  const isVoided = !!installation.voidedAt;
  const isExpired = !isVoided && installation.warrantyExpiresAt < now;
  const tone = isVoided ? 'muted' : isExpired ? 'warning' : 'success';
  const statusLabel = isVoided ? 'Voided' : isExpired ? 'Expired' : 'Active';

  return (
    <>
      <Link href={ADMIN_ROUTES.installations} className="c-admin-back">
        All installations
      </Link>
      <PageHead title={installation.warrantyNumber} intro={`Recorded ${format.dateTime(installation.createdAt)}`}>
        <Pill tone={tone}>{statusLabel}</Pill>
        {!isVoided && (
          <>
            <a
              href={`/api/warranty/${encodeURIComponent(installation.warrantyNumber)}/pdf`}
              className="c-button inline-flex items-center gap-1"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Download className="h-4 w-4" aria-hidden="true" focusable="false" />
              PDF
            </a>
            <Link
              href={`${ADMIN_ROUTES.invoicesNew}?installation=${installation.id}`}
              className="c-button"
              data-variant="primary"
            >
              Create invoice
            </Link>
          </>
        )}
      </PageHead>

      <div className="c-admin-columns" data-layout="detail">
        <div className="c-admin-stack">
          <Panel title="Warranty details">
            <dl className="c-admin-details">
              <div>
                <dt>Warranty number</dt>
                <dd>{installation.warrantyNumber}</dd>
              </div>
              <div>
                <dt>Customer</dt>
                <dd>
                  {customer ? (
                    <Link href={`${ADMIN_ROUTES.customers}/${customer.id}`} className="c-admin-more">
                      {customer.name}
                    </Link>
                  ) : (
                    '—'
                  )}
                </dd>
              </div>
              <div>
                <dt>Vehicle</dt>
                <dd>
                  {vehicle ? [vehicle.make, vehicle.model, vehicle.year, vehicle.plate].filter(Boolean).join(' ') : '—'}
                </dd>
              </div>
              <div>
                <dt>Product</dt>
                <dd>{product ? `${product.name} (${product.finish})` : '—'}</dd>
              </div>
              <div>
                <dt>Area covered</dt>
                <dd>{installation.area}</dd>
              </div>
              <div>
                <dt>Film used</dt>
                <dd>{metres(installation.metresUsed)}</dd>
              </div>
              <div>
                <dt>Roll</dt>
                <dd>{roll ? `LOT ${roll.lotNumber}` : '—'}</dd>
              </div>
              <div>
                <dt>Installer</dt>
                <dd>{installation.installer}</dd>
              </div>
              <div>
                <dt>Vendor</dt>
                <dd>
                  {vendor ? (
                    <Link href={`${ADMIN_ROUTES.vendors}/${vendor.id}`} className="c-admin-more">
                      {vendor.shopName}
                    </Link>
                  ) : (
                    '—'
                  )}
                </dd>
              </div>
              <div>
                <dt>Installed</dt>
                <dd>{format.date(installation.installedAt)}</dd>
              </div>
              <div>
                <dt>Warranty expires</dt>
                <dd>{format.date(installation.warrantyExpiresAt)}</dd>
              </div>
              {product && (
                <div>
                  <dt>Warranty period</dt>
                  <dd>
                    {product.warrantyYears} {product.warrantyYears === 1 ? 'year' : 'years'}
                  </dd>
                </div>
              )}
            </dl>
          </Panel>

          {isVoided && (
            <Panel title="Voided">
              <dl className="c-admin-details">
                <div>
                  <dt>Voided at</dt>
                  <dd>{format.dateTime(installation.voidedAt!)}</dd>
                </div>
                <div>
                  <dt>Reason</dt>
                  <dd>{installation.voidReason}</dd>
                </div>
              </dl>
            </Panel>
          )}
        </div>

        <div className="c-admin-stack">
          {!isVoided && (
            <Panel title="Void this installation">
              <p className="c-admin-muted">
                Voiding restores {metres(installation.metresUsed)} to the roll and invalidates the warranty. This cannot
                be undone.
              </p>
              <AdminForm action={voidInstallation} submitLabel="Void installation">
                <input type="hidden" name="id" value={installation.id} />
                <Field label="Reason">
                  <textarea className="c-input" name="reason" rows={3} maxLength={500} required />
                </Field>
              </AdminForm>
            </Panel>
          )}
        </div>
      </div>
    </>
  );
}
