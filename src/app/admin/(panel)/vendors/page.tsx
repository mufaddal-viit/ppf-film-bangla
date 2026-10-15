import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState, PageHead, Pill } from '@/components/admin/ui';
import { ADMIN_ROUTES } from '@/lib/admin/constants';
import { requireSession } from '@/lib/auth/session';
import { portalUserRepository } from '@/lib/db/repositories/portal-user.repository';
import { vendorRepository } from '@/lib/db/repositories/vendor.repository';

export const metadata: Metadata = { title: 'Vendors' };

export default async function AdminVendorsPage() {
  await requireSession('owner');
  const [vendors, logins] = await Promise.all([vendorRepository.list(), portalUserRepository.countByVendor()]);

  return (
    <>
      <PageHead
        title="Vendors"
        intro={`${vendors.length} ${vendors.length === 1 ? 'shop' : 'shops'}. Vendors install film and issue warranties from their own portal.`}
      >
        <Link className="c-button" data-variant="primary" href={ADMIN_ROUTES.vendorsNew}>
          Add vendor
        </Link>
      </PageHead>

      {vendors.length === 0 ? (
        <EmptyState>No vendors yet. Add a shop, then create a sign-in for its people.</EmptyState>
      ) : (
        <div className="c-admin-table">
          <table>
            <thead>
              <tr>
                <th>Shop</th>
                <th>Contact</th>
                <th>Phone</th>
                <th>Installers</th>
                <th>Sign-ins</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((vendor) => (
                <tr key={vendor.id}>
                  <td data-cell="title">
                    <Link href={`${ADMIN_ROUTES.vendors}/${vendor.id}`}>{vendor.shopName}</Link>
                    <small>{vendor.address}</small>
                  </td>
                  <td data-label="Contact">
                    {vendor.contactName}
                    <small>{vendor.email}</small>
                  </td>
                  <td data-label="Phone" dir="ltr">
                    {vendor.phone}
                  </td>
                  <td data-label="Installers">{vendor.installers.length}</td>
                  <td data-label="Sign-ins">{logins[vendor.id] ?? 0}</td>
                  <td data-cell="status">
                    <Pill tone={vendor.active ? 'success' : 'muted'}>{vendor.active ? 'Active' : 'Deactivated'}</Pill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
