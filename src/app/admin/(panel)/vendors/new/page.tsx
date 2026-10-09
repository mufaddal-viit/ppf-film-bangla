import type { Metadata } from 'next';
import Link from 'next/link';
import { createVendor } from '@/app/actions/admin';
import { AdminForm } from '@/components/admin/admin-form';
import { PageHead, Panel } from '@/components/admin/ui';
import { VendorFields } from '@/components/admin/vendor-fields';
import { ADMIN_ROUTES } from '@/lib/admin/constants';
import { requireSession } from '@/lib/auth/session';

export const metadata: Metadata = { title: 'Add vendor' };

export default async function AdminNewVendorPage() {
  await requireSession('owner');
  return (
    <>
      <Link href={ADMIN_ROUTES.vendors} className="c-admin-back">
        All vendors
      </Link>
      <PageHead title="Add vendor" intro="Sign-ins for the shop's people are created on the next screen." />
      <Panel className="c-admin-narrow">
        <AdminForm action={createVendor} submitLabel="Add vendor">
          <VendorFields />
        </AdminForm>
      </Panel>
    </>
  );
}
