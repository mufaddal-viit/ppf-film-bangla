import { Download } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState, PageHead, Pill } from '@/components/admin/ui';
import { ADMIN_ROUTES } from '@/lib/admin/constants';
import { adminDates } from '@/lib/admin/format';
import { requireSession } from '@/lib/auth/session';
import { siteConfig } from '@/lib/config';
import { INVOICE_STATUSES, type InvoiceStatus } from '@/lib/db/collections';
import { customerRepository } from '@/lib/db/repositories/customer.repository';
import { invoiceRepository } from '@/lib/db/repositories/invoice.repository';
import { vendorRepository } from '@/lib/db/repositories/vendor.repository';

export const metadata: Metadata = { title: 'Invoices' };

const PAGE_SIZE = 50;

const STATUS_TONE: Record<InvoiceStatus, 'success' | 'muted' | 'warning'> = {
  draft: 'muted',
  issued: 'warning',
  paid: 'success',
  cancelled: 'muted',
};

function money(amount: number, currency: string) {
  return `${currency} ${amount.toFixed(2)}`;
}

export default async function AdminInvoicesPage({ searchParams }: PageProps<'/admin/invoices'>) {
  await requireSession('owner');
  const query = await searchParams;
  const page = Math.max(1, Number(query.page) || 1);
  const statusFilter = INVOICE_STATUSES.includes(query.status as InvoiceStatus)
    ? (query.status as InvoiceStatus)
    : undefined;
  const vendorFilter = typeof query.vendor === 'string' ? query.vendor : undefined;
  const q = typeof query.q === 'string' ? query.q.trim() : undefined;

  const { items: invoices, total } = await invoiceRepository.list(
    { status: statusFilter, vendorId: vendorFilter, q },
    { skip: (page - 1) * PAGE_SIZE, limit: PAGE_SIZE },
  );
  const format = adminDates(siteConfig.locale.timezone);
  const [vendors] = await Promise.all([vendorRepository.list()]);
  const vendorMap = new Map(vendors.map((v) => [v.id, v.shopName]));

  const customerIds = [...new Set(invoices.map((i) => i.customerId))];
  const customerMap = new Map<string, string>();
  for (const cid of customerIds) {
    const c = await customerRepository.findById(cid);
    if (c) customerMap.set(cid, c.name);
  }

  const pages = Math.ceil(total / PAGE_SIZE);

  return (
    <>
      <PageHead title="Invoices" intro={`${total} invoice${total !== 1 ? 's' : ''}.`} />

      <form method="get" className="c-admin-filters">
        <input className="c-input" type="search" name="q" defaultValue={q} placeholder="Invoice number" />
        <select className="c-input" name="status" defaultValue={statusFilter ?? ''}>
          <option value="">All statuses</option>
          {INVOICE_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
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

      {invoices.length === 0 ? (
        <EmptyState>
          {q || statusFilter || vendorFilter
            ? 'No invoices match that filter.'
            : 'No invoices yet. Create one from an installation.'}
        </EmptyState>
      ) : (
        <>
          <div className="c-admin-table">
            <table>
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Customer</th>
                  <th>Vendor</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td data-cell="title">
                      <Link href={`${ADMIN_ROUTES.invoices}/${inv.id}`}>{inv.invoiceNumber}</Link>
                    </td>
                    <td data-label="Customer">{customerMap.get(inv.customerId) ?? '—'}</td>
                    <td data-label="Vendor">{vendorMap.get(inv.vendorId) ?? '—'}</td>
                    <td data-label="Total">{money(inv.total, inv.currency)}</td>
                    <td data-label="Date">{format.date(inv.createdAt)}</td>
                    <td data-cell="status">
                      <Pill tone={STATUS_TONE[inv.status]}>
                        {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                      </Pill>
                    </td>
                    <td>
                      <a
                        href={`/api/invoice/${encodeURIComponent(inv.invoiceNumber)}/pdf`}
                        className="c-admin-more inline-flex items-center gap-1"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Download PDF for ${inv.invoiceNumber}`}
                      >
                        <Download className="h-4 w-4" aria-hidden="true" focusable="false" />
                        PDF
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pages > 1 && (
            <nav className="c-admin-pagination" aria-label="Pages">
              {page > 1 && <Link href={`${ADMIN_ROUTES.invoices}?page=${page - 1}`}>Previous</Link>}
              <span>
                Page {page} of {pages}
              </span>
              {page < pages && <Link href={`${ADMIN_ROUTES.invoices}?page=${page + 1}`}>Next</Link>}
            </nav>
          )}
        </>
      )}
    </>
  );
}
