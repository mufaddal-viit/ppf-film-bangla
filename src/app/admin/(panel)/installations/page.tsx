import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState, PageHead, Pill } from '@/components/admin/ui';
import { ADMIN_ROUTES } from '@/lib/admin/constants';
import { adminDates, metres } from '@/lib/admin/format';
import { requireSession } from '@/lib/auth/session';
import { siteConfig } from '@/lib/config';
import { customerRepository } from '@/lib/db/repositories/customer.repository';
import { installationRepository } from '@/lib/db/repositories/installation.repository';
import { productRepository } from '@/lib/db/repositories/product.repository';
import { vendorRepository } from '@/lib/db/repositories/vendor.repository';

export const metadata: Metadata = { title: 'Installations' };

const PAGE_SIZE = 50;

export default async function AdminInstallationsPage({ searchParams }: PageProps<'/admin/installations'>) {
  await requireSession('owner');
  const query = await searchParams;
  const page = Math.max(1, Number(query.page) || 1);
  const q = typeof query.q === 'string' ? query.q.trim() : undefined;
  const vendorFilter = typeof query.vendor === 'string' ? query.vendor : undefined;

  const { items: installations, total } = await installationRepository.list(
    { q, vendorId: vendorFilter },
    { skip: (page - 1) * PAGE_SIZE, limit: PAGE_SIZE },
  );
  const format = adminDates(siteConfig.locale.timezone);

  // Batch-load related names.
  const [products, vendors] = await Promise.all([productRepository.list(), vendorRepository.list()]);
  const productMap = new Map(products.map((p) => [p.id, p.name]));
  const vendorMap = new Map(vendors.map((v) => [v.id, v.shopName]));
  const customerIds = [...new Set(installations.map((i) => i.customerId))];
  const customerMap = new Map<string, string>();
  for (const cid of customerIds) {
    const c = await customerRepository.findById(cid);
    if (c) customerMap.set(cid, c.name);
  }

  const active = total;
  const pages = Math.ceil(total / PAGE_SIZE);

  return (
    <>
      <PageHead title="Installations" intro={`${active} installation${active !== 1 ? 's' : ''} total.`} />

      <form method="get" className="c-admin-filters">
        <input
          className="c-input"
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Warranty #, installer or area"
        />
        <select className="c-input" name="vendor" defaultValue={vendorFilter ?? ''}>
          <option value="">All vendors</option>
          {vendors.map((v) => (
            <option key={v.id} value={v.id}>
              {v.shopName}
            </option>
          ))}
        </select>
        <button className="c-button" type="submit">
          Filter
        </button>
      </form>

      {installations.length === 0 ? (
        <EmptyState>
          {q || vendorFilter ? 'No installations match that filter.' : 'No installations recorded yet.'}
        </EmptyState>
      ) : (
        <>
          <div className="c-admin-table">
            <table>
              <thead>
                <tr>
                  <th>Warranty #</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Vendor</th>
                  <th>Area</th>
                  <th>Film</th>
                  <th>Installed</th>
                  <th>Expires</th>
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
                      </td>
                      <td data-label="Customer">
                        {customerMap.has(inst.customerId) ? (
                          <Link href={`${ADMIN_ROUTES.customers}/${inst.customerId}`}>
                            {customerMap.get(inst.customerId)}
                          </Link>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td data-label="Product">{productMap.get(inst.productId) ?? '—'}</td>
                      <td data-label="Vendor">{vendorMap.get(inst.vendorId) ?? '—'}</td>
                      <td data-label="Area">{inst.area}</td>
                      <td data-label="Film">{metres(inst.metresUsed)}</td>
                      <td data-label="Installed">{format.date(inst.installedAt)}</td>
                      <td data-label="Expires">{format.date(inst.warrantyExpiresAt)}</td>
                      <td data-cell="status">
                        <Pill tone={tone}>{label}</Pill>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {pages > 1 && (
            <nav className="c-admin-pagination" aria-label="Pages">
              {page > 1 && (
                <Link
                  href={`${ADMIN_ROUTES.installations}?page=${page - 1}${q ? `&q=${encodeURIComponent(q)}` : ''}${vendorFilter ? `&vendor=${vendorFilter}` : ''}`}
                >
                  Previous
                </Link>
              )}
              <span>
                Page {page} of {pages}
              </span>
              {page < pages && (
                <Link
                  href={`${ADMIN_ROUTES.installations}?page=${page + 1}${q ? `&q=${encodeURIComponent(q)}` : ''}${vendorFilter ? `&vendor=${vendorFilter}` : ''}`}
                >
                  Next
                </Link>
              )}
            </nav>
          )}
        </>
      )}
    </>
  );
}
