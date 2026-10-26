import { Download } from 'lucide-react';
import type { Metadata } from 'next';
import { EmptyState, PageHead, Pill } from '@/components/admin/ui';
import { adminDates } from '@/lib/admin/format';
import { siteConfig } from '@/lib/config';
import type { InvoiceStatus } from '@/lib/db/collections';
import { customerRepository } from '@/lib/db/repositories/customer.repository';
import { invoiceRepository } from '@/lib/db/repositories/invoice.repository';
import { requireVendorSession } from '@/lib/vendor/session';

export const metadata: Metadata = { title: 'Invoices' };

const STATUS_TONE: Record<InvoiceStatus, 'success' | 'muted' | 'warning'> = {
  draft: 'muted',
  issued: 'warning',
  paid: 'success',
  cancelled: 'muted',
};

function money(amount: number, currency: string) {
  return `${currency} ${amount.toFixed(2)}`;
}

export default async function VendorInvoicesPage() {
  const { vendorId } = await requireVendorSession();
  const invoices = await invoiceRepository.listForVendor(vendorId);
  const format = adminDates(siteConfig.locale.timezone);

  const customerIds = [...new Set(invoices.map((i) => i.customerId))];
  const customerMap = new Map<string, string>();
  for (const cid of customerIds) {
    const c = await customerRepository.findById(cid);
    if (c) customerMap.set(cid, c.name);
  }

  return (
    <>
      <PageHead title="Invoices" intro={`${invoices.length} invoice${invoices.length !== 1 ? 's' : ''}.`} />

      {invoices.length === 0 ? (
        <EmptyState>No invoices for your shop yet.</EmptyState>
      ) : (
        <div className="c-admin-table">
          <table>
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Customer</th>
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
                    <strong>{inv.invoiceNumber}</strong>
                  </td>
                  <td data-label="Customer">{customerMap.get(inv.customerId) ?? '—'}</td>
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
      )}
    </>
  );
}
