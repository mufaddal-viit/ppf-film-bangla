import type { Metadata } from 'next';
import Link from 'next/link';
import { createVendorCustomer } from '@/app/actions/vendor';
import { AdminForm } from '@/components/admin/admin-form';
import { Field, PageHead, Panel } from '@/components/admin/ui';
import { VENDOR_ROUTES } from '@/lib/vendor/constants';
import { requireVendorSession } from '@/lib/vendor/session';

export const metadata: Metadata = { title: 'Add customer' };

export default async function VendorNewCustomerPage() {
  await requireVendorSession();

  return (
    <>
      <Link href={VENDOR_ROUTES.customers} className="c-admin-back">
        All customers
      </Link>
      <PageHead title="Add customer" intro="Add a new customer with their first vehicle." />

      <Panel title="Customer details" className="c-admin-narrow">
        <AdminForm action={createVendorCustomer} submitLabel="Add customer" className="c-admin-form-grid">
          <Field label="Full name">
            <input className="c-input" name="name" autoComplete="off" autoCapitalize="words" maxLength={100} required />
          </Field>
          <Field label="Phone">
            <input className="c-input" type="tel" name="phone" dir="ltr" autoComplete="off" maxLength={20} required />
          </Field>
          <Field label="Email (optional)">
            <input className="c-input" type="email" name="email" autoComplete="off" maxLength={254} />
          </Field>

          <p className="c-admin-nav-label">First vehicle</p>
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
    </>
  );
}
