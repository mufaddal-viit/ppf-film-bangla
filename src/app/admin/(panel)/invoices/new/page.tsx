import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createInvoice } from '@/app/actions/admin';
import { AdminForm } from '@/components/admin/admin-form';
import { Field, PageHead, Panel } from '@/components/admin/ui';
import { ADMIN_ROUTES } from '@/lib/admin/constants';
import { metres } from '@/lib/admin/format';
import { requireSession } from '@/lib/auth/session';
import { customerRepository } from '@/lib/db/repositories/customer.repository';
import { installationRepository } from '@/lib/db/repositories/installation.repository';
import { productRepository } from '@/lib/db/repositories/product.repository';
import { vendorRepository } from '@/lib/db/repositories/vendor.repository';

export const metadata: Metadata = { title: 'Create invoice' };

export default async function AdminNewInvoicePage({ searchParams }: PageProps<'/admin/invoices/new'>) {
  await requireSession('owner');
  const query = await searchParams;
  const installationId = typeof query.installation === 'string' ? query.installation : null;
  if (!installationId) notFound();

  const installation = await installationRepository.findById(installationId);
  if (!installation || installation.voidedAt) notFound();

  const [customer, product, vendor] = await Promise.all([
    customerRepository.findById(installation.customerId),
    productRepository.findById(installation.productId),
    vendorRepository.findById(installation.vendorId),
  ]);

  const description = product
    ? `${product.name} (${product.finish}) — ${installation.area}, ${metres(installation.metresUsed)}`
    : `Installation ${installation.warrantyNumber}`;

  return (
    <>
      <Link href={ADMIN_ROUTES.invoices} className="c-admin-back">
        All invoices
      </Link>
      <PageHead
        title="Create invoice"
        intro={`From installation ${installation.warrantyNumber} for ${customer?.name ?? 'unknown customer'}.`}
      />

      <Panel title="Invoice details" className="c-admin-narrow">
        <dl className="c-admin-details">
          <div>
            <dt>Installation</dt>
            <dd>
              <Link href={`${ADMIN_ROUTES.installations}/${installation.id}`} className="c-admin-more">
                {installation.warrantyNumber}
              </Link>
            </dd>
          </div>
          <div>
            <dt>Customer</dt>
            <dd>{customer?.name ?? '—'}</dd>
          </div>
          <div>
            <dt>Vendor</dt>
            <dd>{vendor?.shopName ?? '—'}</dd>
          </div>
          <div>
            <dt>Line item</dt>
            <dd>{description}</dd>
          </div>
          <div>
            <dt>Quantity</dt>
            <dd>{installation.metresUsed} m</dd>
          </div>
        </dl>

        <AdminForm action={createInvoice} submitLabel="Create invoice" className="c-admin-form-grid">
          <input type="hidden" name="installationId" value={installation.id} />
          <Field label="Unit price (per metre)" hint="The line item total = unit price x metres used.">
            <input
              className="c-input"
              type="number"
              name="unitPrice"
              min={0}
              max={999999}
              step={0.01}
              inputMode="decimal"
              required
            />
          </Field>
          <Field label="VAT rate" hint="Enter as a decimal, e.g. 0.05 for 5%. Enter 0 for no VAT.">
            <input
              className="c-input"
              type="number"
              name="vatRate"
              min={0}
              max={1}
              step={0.01}
              defaultValue={0}
              inputMode="decimal"
              required
            />
          </Field>
          <Field label="Notes (optional)">
            <textarea className="c-input" name="notes" rows={3} maxLength={1000} />
          </Field>
        </AdminForm>
      </Panel>
    </>
  );
}
