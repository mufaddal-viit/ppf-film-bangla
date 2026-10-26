import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  addCustomerNote,
  addCustomerVehicle,
  markCustomerContacted,
  removeCustomerVehicle,
  updateCustomer,
} from '@/app/actions/admin';
import { AdminForm } from '@/components/admin/admin-form';
import { CustomerFields } from '@/components/admin/customer-fields';
import { EmptyState, Field, PageHead, Panel, Pill } from '@/components/admin/ui';
import { ADMIN_ROUTES } from '@/lib/admin/constants';
import { adminDates, metres } from '@/lib/admin/format';
import { requireSession } from '@/lib/auth/session';
import { siteConfig } from '@/lib/config';
import { customerRepository } from '@/lib/db/repositories/customer.repository';
import { installationRepository } from '@/lib/db/repositories/installation.repository';
import { productRepository } from '@/lib/db/repositories/product.repository';
import { vendorRepository } from '@/lib/db/repositories/vendor.repository';

export const metadata: Metadata = { title: 'Customer' };

export default async function AdminCustomerPage({ params }: PageProps<'/admin/customers/[id]'>) {
  await requireSession();
  const { id } = await params;
  const customer = await customerRepository.findById(id);
  if (!customer) notFound();
  const format = adminDates(siteConfig.locale.timezone);
  const [installations, products, vendors] = await Promise.all([
    installationRepository.listForCustomer(id),
    productRepository.list(),
    vendorRepository.list(),
  ]);
  const productMap = new Map(products.map((p) => [p.id, p.name]));
  const vendorMap = new Map(vendors.map((v) => [v.id, v.shopName]));

  return (
    <>
      <Link href={ADMIN_ROUTES.customers} className="c-admin-back">
        All customers
      </Link>
      <PageHead title={customer.name} intro={`Customer since ${format.date(customer.createdAt)}`}>
        <Pill tone={customer.marketingOptIn ? 'success' : 'muted'}>
          {customer.marketingOptIn ? 'Agreed to offers' : 'No offers'}
        </Pill>
      </PageHead>

      <div className="c-admin-columns" data-layout="detail">
        <div className="c-admin-stack">
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
            <p className="c-admin-muted">
              {customer.lastContactedAt
                ? `Last contacted ${format.date(customer.lastContactedAt)}.`
                : 'Not contacted since becoming a customer.'}
              {customer.leadId && (
                <>
                  {' '}
                  <Link href={`${ADMIN_ROUTES.leads}/${customer.leadId}`} className="c-admin-more">
                    Original enquiry
                  </Link>
                </>
              )}
            </p>
            <AdminForm action={markCustomerContacted} submitLabel="Mark as contacted today" quiet>
              <input type="hidden" name="id" value={customer.id} />
            </AdminForm>
          </Panel>

          <Panel title="Vehicles">
            {customer.vehicles.length === 0 ? (
              <EmptyState>No vehicles yet. Add the car that was protected.</EmptyState>
            ) : (
              <ul className="c-admin-vehicles">
                {customer.vehicles.map((vehicle) => (
                  <li key={vehicle.id}>
                    <div>
                      <strong>
                        {vehicle.make} {vehicle.model}
                      </strong>
                      <span>{[vehicle.year, vehicle.plate].filter(Boolean).join(' · ') || 'No year or plate'}</span>
                    </div>
                    <AdminForm action={removeCustomerVehicle} submitLabel="Remove" quiet>
                      <input type="hidden" name="id" value={customer.id} />
                      <input type="hidden" name="vehicleId" value={vehicle.id} />
                    </AdminForm>
                  </li>
                ))}
              </ul>
            )}
            <AdminForm
              action={addCustomerVehicle}
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

          <Panel title="Installations">
            {installations.length === 0 ? (
              <EmptyState>No installations recorded for this customer.</EmptyState>
            ) : (
              <div className="c-admin-table">
                <table>
                  <thead>
                    <tr>
                      <th>Warranty #</th>
                      <th>Product</th>
                      <th>Area</th>
                      <th>Vendor</th>
                      <th>Installed</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {installations.map((inst) => {
                      const now = new Date();
                      const isVoided = !!inst.voidedAt;
                      const isExpired = !isVoided && inst.warrantyExpiresAt < now;
                      const tone = isVoided ? 'muted' : isExpired ? 'warning' : 'success';
                      const label = isVoided ? 'Voided' : isExpired ? 'Expired' : 'Active';
                      return (
                        <tr key={inst.id}>
                          <td data-cell="title">
                            <Link href={`${ADMIN_ROUTES.installations}/${inst.id}`}>{inst.warrantyNumber}</Link>
                            <small>{metres(inst.metresUsed)} used</small>
                          </td>
                          <td data-label="Product">{productMap.get(inst.productId) ?? '—'}</td>
                          <td data-label="Area">{inst.area}</td>
                          <td data-label="Vendor">{vendorMap.get(inst.vendorId) ?? '—'}</td>
                          <td data-label="Installed">{format.date(inst.installedAt)}</td>
                          <td data-cell="status">
                            <Pill tone={tone}>{label}</Pill>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>

          <Panel title="Notes">
            {customer.notes.length === 0 ? (
              <EmptyState>No notes yet. Record jobs done, preferences and what was agreed.</EmptyState>
            ) : (
              <ul className="c-admin-notes">
                {customer.notes.map((note) => (
                  <li key={note.id}>
                    <p>{note.text}</p>
                    <small>
                      {note.authorName} · {format.dateTime(note.at)}
                    </small>
                  </li>
                ))}
              </ul>
            )}
            <AdminForm action={addCustomerNote} submitLabel="Add note" resetOnSuccess quiet>
              <input type="hidden" name="id" value={customer.id} />
              <Field label="New note">
                <textarea className="c-input" name="text" rows={3} maxLength={2000} required />
              </Field>
            </AdminForm>
          </Panel>
        </div>

        <div className="c-admin-stack">
          <Panel title="Details">
            <AdminForm action={updateCustomer} submitLabel="Save details">
              <input type="hidden" name="id" value={customer.id} />
              <CustomerFields customer={customer} />
            </AdminForm>
          </Panel>
        </div>
      </div>
    </>
  );
}
