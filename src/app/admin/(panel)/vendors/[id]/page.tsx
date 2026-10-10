import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  createVendorLogin,
  removeRoll,
  resetVendorLoginPassword,
  setVendorLoginActive,
  updateVendor,
} from '@/app/actions/admin';
import { AdminForm } from '@/components/admin/admin-form';
import { RollTable } from '@/components/admin/roll-table';
import { EmptyState, Field, PageHead, Panel, Pill } from '@/components/admin/ui';
import { VendorFields } from '@/components/admin/vendor-fields';
import { ADMIN_ROUTES } from '@/lib/admin/constants';
import { adminDates, metres } from '@/lib/admin/format';
import { stockTotals, toRollRows } from '@/lib/admin/roll-rows';
import { requireSession } from '@/lib/auth/session';
import { siteConfig } from '@/lib/config';
import { portalUserRepository } from '@/lib/db/repositories/portal-user.repository';
import { productRepository } from '@/lib/db/repositories/product.repository';
import { rollRepository } from '@/lib/db/repositories/roll.repository';
import { vendorRepository } from '@/lib/db/repositories/vendor.repository';
import { VENDOR_ROUTES } from '@/lib/vendor/constants';

export const metadata: Metadata = { title: 'Vendor' };

export default async function AdminVendorPage({ params, searchParams }: PageProps<'/admin/vendors/[id]'>) {
  await requireSession('owner');
  const { id } = await params;
  const [vendor, logins, rolls, products, query] = await Promise.all([
    vendorRepository.findById(id),
    portalUserRepository.listForVendor(id),
    rollRepository.listForVendor(id),
    productRepository.list(),
    searchParams,
  ]);
  if (!vendor) notFound();
  const format = adminDates(siteConfig.locale.timezone);
  const totals = stockTotals(rolls);

  return (
    <>
      <Link href={ADMIN_ROUTES.vendors} className="c-admin-back">
        All vendors
      </Link>
      <PageHead title={vendor.shopName} intro={`Vendor since ${format.date(vendor.createdAt)}`}>
        <Pill tone={vendor.active ? 'success' : 'muted'}>{vendor.active ? 'Active' : 'Deactivated'}</Pill>
      </PageHead>

      {query.created === '1' && logins.length === 0 && (
        <p className="c-admin-notice">
          Vendor added. Create a sign-in below so the shop can open the vendor portal at {VENDOR_ROUTES.login}.
        </p>
      )}

      <div className="c-admin-columns" data-layout="detail">
        <Panel title="Shop details">
          <AdminForm action={updateVendor} submitLabel="Save">
            <input type="hidden" name="id" value={vendor.id} />
            <VendorFields vendor={vendor} />
            <label className="c-admin-check">
              <input type="checkbox" name="active" defaultChecked={vendor.active} />
              <span>Active (untick to lock the whole shop out of the portal)</span>
            </label>
          </AdminForm>
        </Panel>

        <div className="c-admin-stack">
          <Panel title="Sign-ins">
            {logins.length === 0 ? (
              <EmptyState>Nobody at this shop can sign in yet.</EmptyState>
            ) : (
              <ul className="c-admin-logins">
                {logins.map((login) => (
                  <li key={login.id}>
                    <header>
                      <div>
                        <strong>{login.name}</strong>
                        <span>{login.email}</span>
                        <span>
                          {login.lastLoginAt
                            ? `Last signed in ${format.dateTime(login.lastLoginAt)}`
                            : 'Never signed in'}
                        </span>
                      </div>
                      {!login.active ? (
                        <Pill tone="muted">Switched off</Pill>
                      ) : login.mustChangePassword ? (
                        <Pill tone="warning">Temporary password</Pill>
                      ) : (
                        <Pill tone="success">Active</Pill>
                      )}
                    </header>
                    <div className="c-admin-logins-actions">
                      <AdminForm action={resetVendorLoginPassword} submitLabel="New temporary password" quiet>
                        <input type="hidden" name="id" value={login.id} />
                      </AdminForm>
                      <AdminForm
                        action={setVendorLoginActive}
                        submitLabel={login.active ? 'Switch off' : 'Switch on'}
                        quiet
                      >
                        <input type="hidden" name="id" value={login.id} />
                        <input type="hidden" name="active" value={String(!login.active)} />
                      </AdminForm>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Add a sign-in">
            <p className="c-admin-muted">
              A temporary password is made for you and shown once. The person must choose their own at first sign-in.
            </p>
            <AdminForm action={createVendorLogin} submitLabel="Create sign-in" resetOnSuccess>
              <input type="hidden" name="vendorId" value={vendor.id} />
              <Field label="Name">
                <input className="c-input" name="name" maxLength={100} required />
              </Field>
              <Field label="Email" hint="They sign in with this address.">
                <input className="c-input" type="email" name="email" autoComplete="off" maxLength={254} required />
              </Field>
            </AdminForm>
          </Panel>
        </div>
      </div>

      <Panel
        title="Stock at this shop"
        action={
          vendor.active && (
            <Link href={`${ADMIN_ROUTES.stock}?vendor=${vendor.id}`} className="c-admin-more">
              Allocate a roll
            </Link>
          )
        }
      >
        {rolls.length === 0 ? (
          <EmptyState>No film allocated to this shop yet, so it cannot record installations.</EmptyState>
        ) : (
          <>
            <p className="c-admin-muted">
              {totals.rolls} {totals.rolls === 1 ? 'roll' : 'rolls'}, {metres(totals.leftM)} of{' '}
              {metres(totals.allocatedM)} left.
            </p>
            <RollTable rolls={toRollRows(rolls, { products, date: format.date })} removeAction={removeRoll} />
          </>
        )}
      </Panel>
    </>
  );
}
