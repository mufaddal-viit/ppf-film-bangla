import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState, PageHead } from '@/components/admin/ui';
import { adminDates } from '@/lib/admin/format';
import { siteConfig } from '@/lib/config';
import { customerRepository } from '@/lib/db/repositories/customer.repository';
import { VENDOR_ROUTES } from '@/lib/vendor/constants';
import { requireVendorSession } from '@/lib/vendor/session';

export const metadata: Metadata = { title: 'Customers' };

export default async function VendorCustomersPage() {
  const { vendorId } = await requireVendorSession();
  const { items: customers } = await customerRepository.listForVendor(vendorId, { skip: 0, limit: 200 });
  const format = adminDates(siteConfig.locale.timezone);

  return (
    <>
      <PageHead
        title="Customers"
        intro={`${customers.length} customer${customers.length !== 1 ? 's' : ''} at your shop.`}
      >
        <Link className="c-button" data-variant="primary" href={VENDOR_ROUTES.customersNew}>
          Add customer
        </Link>
      </PageHead>

      {customers.length === 0 ? (
        <EmptyState>No customers yet. Add your first customer to start recording installations.</EmptyState>
      ) : (
        <div className="c-admin-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Vehicles</th>
                <th>Added</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td data-cell="title">
                    <Link href={`${VENDOR_ROUTES.customers}/${c.id}`}>{c.name}</Link>
                  </td>
                  <td data-label="Phone" dir="ltr">
                    {c.phone}
                  </td>
                  <td data-label="Vehicles">
                    {c.vehicles.length === 0 ? '—' : c.vehicles.map((v) => `${v.make} ${v.model}`).join(', ')}
                  </td>
                  <td data-label="Added">{format.date(c.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
