import type { Metadata } from 'next';
import Link from 'next/link';
import { createCustomer } from '@/app/actions/admin';
import { AdminForm } from '@/components/admin/admin-form';
import { CustomerFields } from '@/components/admin/customer-fields';
import { PageHead, Panel } from '@/components/admin/ui';
import { ADMIN_ROUTES } from '@/lib/admin/constants';
import { requireSession } from '@/lib/auth/session';

export const metadata: Metadata = { title: 'Add customer' };

export default async function AdminNewCustomerPage() {
  await requireSession();
  return (
    <>
      <Link href={ADMIN_ROUTES.customers} className="c-admin-back">
        All customers
      </Link>
      <PageHead title="Add customer" intro="Vehicles and notes are added on the next screen." />
      <Panel className="c-admin-narrow">
        <AdminForm action={createCustomer} submitLabel="Add customer">
          <CustomerFields />
        </AdminForm>
      </Panel>
    </>
  );
}
