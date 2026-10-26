import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { addVendorCustomerVehicle } from '@/app/actions/vendor';
import { AdminForm } from '@/components/admin/admin-form';
import { Field, PageHead, Panel } from '@/components/admin/ui';
import { adminDates } from '@/lib/admin/format';
import { siteConfig } from '@/lib/config';
import { customerRepository } from '@/lib/db/repositories/customer.repository';
import { installationRepository } from '@/lib/db/repositories/installation.repository';
import { productRepository } from '@/lib/db/repositories/product.repository';
import { VENDOR_ROUTES } from '@/lib/vendor/constants';
import { requireVendorSession } from '@/lib/vendor/session';

export const metadata: Metadata = { title: 'Customer' };

export default async function VendorCustomerPage({ params }: PageProps<'/vendor/customers/[id]'>) {
  const session = await requireVendorSession();
  const { id } = await params;
  const customer = await customerRepository.findById(id);
  // Only show customers that belong to this vendor.
  if (!customer || String((customer as Record<string, unknown>).vendorId ?? '') !== session.vendorId) notFound();
  const format = adminDates(siteConfig.locale.timezone);

  const [installations, products] = await Promise.all([
    installationRepository.listForCustomer(id),
    productRepository.list(),
  ]);
  const productMap = new Map(products.map((p) => [p.id, p.name]));

  return (
    <>
      <Link href={VENDOR_ROUTES.customers} className="c-admin-back">
        All customers
      </Link>
      <PageHead title={customer.name} intro={`${customer.phone}${customer.email ? ` · ${customer.email}` : ''}`} />

      <div className="c-admin-columns" data-layout="detail">
        <div className="c-admin-stack">
          <Panel title="Vehicles">
            {customer.vehicles.length === 0 ? (
              <p className="c-admin-muted">No vehicles yet.</p>
            ) : (
              <ul className="c-admin-vehicles">
                {customer.vehicles.map((v) => (
                  <li key={v.id}>
                    <div>
                      <strong>
                        {v.make} {v.model}
                      </strong>
                      <span>{[v.year, v.plate].filter(Boolean).join(' · ') || 'No year or plate'}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <AdminForm
              action={addVendorCustomerVehicle}
              submitLabel="Add vehicle"
              resetOnSuccess
              quiet
              className="c-admin-form-grid"
            >
              <input type="hidden" name="id" value={customer.id} />
              <Field label="Make" half>
                <input
                  className="c-input"
                  name="make"
                  autoComplete="off"
                  autoCapitalize="words"
                  placeholder="Toyota"
                  maxLength={40}
                  required
                />
              </Field>
              <Field label="Model" half>
                <input
                  className="c-input"
                  name="model"
                  autoComplete="off"
                  autoCapitalize="words"
                  placeholder="Land Cruiser"
                  maxLength={40}
                  required
                />
              </Field>
              <Field label="Year (optional)" half>
                <input className="c-input" name="year" inputMode="numeric" autoComplete="off" maxLength={4} />
              </Field>
              <Field label="Plate (optional)" half>
                <input
                  className="c-input"
                  name="plate"
                  dir="ltr"
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  maxLength={20}
                />
              </Field>
            </AdminForm>
          </Panel>

          {installations.length > 0 && (
            <Panel title="Installations">
              <div className="c-admin-table">
                <table>
                  <thead>
                    <tr>
                      <th>Warranty #</th>
                      <th>Product</th>
                      <th>Area</th>
                      <th>Installed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {installations.map((inst) => (
                      <tr key={inst.id}>
                        <td data-cell="title">
                          <strong>{inst.warrantyNumber}</strong>
                        </td>
                        <td data-label="Product">{productMap.get(inst.productId) ?? '—'}</td>
                        <td data-label="Area">{inst.area}</td>
                        <td data-label="Installed">{format.date(inst.installedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          )}
        </div>

        <Panel title="Contact">
          <div className="c-admin-contact">
            <a className="c-button" data-variant="primary" href={`tel:${customer.phone}`}>
              Call <span dir="ltr">{customer.phone}</span>
            </a>
            <a
              className="c-button"
              href={`https://wa.me/${customer.phone.replace('+', '')}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </a>
            {customer.email && (
              <a className="c-button" href={`mailto:${customer.email}`}>
                {customer.email}
              </a>
            )}
          </div>
          <p className="c-admin-muted">Customer since {format.date(customer.createdAt)}</p>
        </Panel>
      </div>
    </>
  );
}
