import { Download } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { setInvoiceStatus } from '@/app/actions/admin';
import { AdminForm } from '@/components/admin/admin-form';
import { PageHead, Panel, Pill } from '@/components/admin/ui';
import { ADMIN_ROUTES } from '@/lib/admin/constants';
import { adminDates } from '@/lib/admin/format';
import { requireSession } from '@/lib/auth/session';
import { siteConfig } from '@/lib/config';
import type { InvoiceStatus } from '@/lib/db/collections';
import { customerRepository } from '@/lib/db/repositories/customer.repository';
import { installationRepository } from '@/lib/db/repositories/installation.repository';
import { invoiceRepository } from '@/lib/db/repositories/invoice.repository';
import { vendorRepository } from '@/lib/db/repositories/vendor.repository';

export const metadata: Metadata = { title: 'Invoice' };

const STATUS_TONE: Record<InvoiceStatus, 'success' | 'muted' | 'warning'> = {
  draft: 'muted',
  issued: 'warning',
  paid: 'success',
  cancelled: 'muted',
};

function money(amount: number, currency: string) {
  return `${currency} ${amount.toFixed(2)}`;
}

export default async function AdminInvoicePage({ params }: PageProps<'/admin/invoices/[id]'>) {
  await requireSession('owner');
  const { id } = await params;
  const invoice = await invoiceRepository.findById(id);
  if (!invoice) notFound();

  const [customer, vendor] = await Promise.all([
    customerRepository.findById(invoice.customerId),
    vendorRepository.findById(invoice.vendorId),
  ]);
  const format = adminDates(siteConfig.locale.timezone);

  // Load linked installations.
  const installations = await Promise.all(invoice.installationIds.map((iid) => installationRepository.findById(iid)));

  return (
    <>
      <Link href={ADMIN_ROUTES.invoices} className="c-admin-back">
        All invoices
      </Link>
      <PageHead title={invoice.invoiceNumber} intro={`Created ${format.dateTime(invoice.createdAt)}`}>
        <Pill tone={STATUS_TONE[invoice.status]}>
          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
        </Pill>
        <a
          href={`/api/invoice/${encodeURIComponent(invoice.invoiceNumber)}/pdf`}
          className="c-button inline-flex items-center gap-1"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Download className="h-4 w-4" aria-hidden="true" focusable="false" />
          PDF
        </a>
      </PageHead>

      <div className="c-admin-columns" data-layout="detail">
        <div className="c-admin-stack">
          <Panel title="Details">
            <dl className="c-admin-details">
              <div>
                <dt>Customer</dt>
                <dd>
                  {customer ? (
                    <Link href={`${ADMIN_ROUTES.customers}/${customer.id}`} className="c-admin-more">
                      {customer.name}
                    </Link>
                  ) : (
                    '—'
                  )}
                </dd>
              </div>
              <div>
                <dt>Vendor</dt>
                <dd>
                  {vendor ? (
                    <Link href={`${ADMIN_ROUTES.vendors}/${vendor.id}`} className="c-admin-more">
                      {vendor.shopName}
                    </Link>
                  ) : (
                    '—'
                  )}
                </dd>
              </div>
              {invoice.issuedAt && (
                <div>
                  <dt>Issued</dt>
                  <dd>{format.dateTime(invoice.issuedAt)}</dd>
                </div>
              )}
              {invoice.paidAt && (
                <div>
                  <dt>Paid</dt>
                  <dd>{format.dateTime(invoice.paidAt)}</dd>
                </div>
              )}
              {invoice.cancelledAt && (
                <div>
                  <dt>Cancelled</dt>
                  <dd>{format.dateTime(invoice.cancelledAt)}</dd>
                </div>
              )}
              {invoice.notes && (
                <div>
                  <dt>Notes</dt>
                  <dd>{invoice.notes}</dd>
                </div>
              )}
            </dl>
          </Panel>

          <Panel title="Line items">
            <div className="c-admin-table">
              <table>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Qty</th>
                    <th>Unit price</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.lineItems.map((item, i) => (
                    <tr key={i}>
                      <td data-label="Description">{item.description}</td>
                      <td data-label="Qty">{item.quantity}</td>
                      <td data-label="Unit price">{money(item.unitPrice, invoice.currency)}</td>
                      <td data-label="Amount">{money(item.amount, invoice.currency)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3}>
                      <strong>Subtotal</strong>
                    </td>
                    <td>{money(invoice.subtotal, invoice.currency)}</td>
                  </tr>
                  {invoice.vatRate > 0 && (
                    <tr>
                      <td colSpan={3}>VAT ({(invoice.vatRate * 100).toFixed(0)}%)</td>
                      <td>{money(invoice.vatAmount, invoice.currency)}</td>
                    </tr>
                  )}
                  <tr>
                    <td colSpan={3}>
                      <strong>Total</strong>
                    </td>
                    <td>
                      <strong>{money(invoice.total, invoice.currency)}</strong>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Panel>

          {installations.length > 0 && (
            <Panel title="Linked installations">
              <ul className="c-admin-list">
                {installations.map(
                  (inst) =>
                    inst && (
                      <li key={inst.id}>
                        <Link href={`${ADMIN_ROUTES.installations}/${inst.id}`} className="c-admin-more">
                          {inst.warrantyNumber}
                        </Link>
                        <span> — {inst.area}</span>
                      </li>
                    ),
                )}
              </ul>
            </Panel>
          )}
        </div>

        <div className="c-admin-stack">
          <Panel title="Change status">
            {invoice.status === 'draft' && (
              <AdminForm action={setInvoiceStatus} submitLabel="Issue invoice">
                <input type="hidden" name="id" value={invoice.id} />
                <input type="hidden" name="status" value="issued" />
                <p className="c-admin-muted">Mark this invoice as issued and sent to the customer.</p>
              </AdminForm>
            )}
            {(invoice.status === 'draft' || invoice.status === 'issued') && (
              <AdminForm action={setInvoiceStatus} submitLabel="Mark as paid">
                <input type="hidden" name="id" value={invoice.id} />
                <input type="hidden" name="status" value="paid" />
                <p className="c-admin-muted">Record that payment has been received.</p>
              </AdminForm>
            )}
            {invoice.status !== 'cancelled' && invoice.status !== 'paid' && (
              <AdminForm action={setInvoiceStatus} submitLabel="Cancel invoice" quiet>
                <input type="hidden" name="id" value={invoice.id} />
                <input type="hidden" name="status" value="cancelled" />
              </AdminForm>
            )}
            {invoice.status === 'cancelled' && <p className="c-admin-muted">This invoice has been cancelled.</p>}
            {invoice.status === 'paid' && <p className="c-admin-muted">This invoice has been paid.</p>}
          </Panel>
        </div>
      </div>
    </>
  );
}
