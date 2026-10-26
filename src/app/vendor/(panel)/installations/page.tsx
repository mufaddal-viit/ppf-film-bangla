import { Download } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState, PageHead, Pill } from '@/components/admin/ui';
import { adminDates, metres } from '@/lib/admin/format';
import { siteConfig } from '@/lib/config';
import { customerRepository } from '@/lib/db/repositories/customer.repository';
import { installationRepository } from '@/lib/db/repositories/installation.repository';
import { productRepository } from '@/lib/db/repositories/product.repository';
import { VENDOR_ROUTES } from '@/lib/vendor/constants';
import { requireVendorSession } from '@/lib/vendor/session';

export const metadata: Metadata = { title: 'Installations' };

export default async function VendorInstallationsPage() {
  const { vendorId } = await requireVendorSession();
  const [installations, products] = await Promise.all([
    installationRepository.listForVendor(vendorId),
    productRepository.list(),
  ]);
  const format = adminDates(siteConfig.locale.timezone);

  // Batch-load customer names for display.
  const customerIds = [...new Set(installations.map((i) => i.customerId))];
  const customerMap = new Map<string, string>();
  for (const cid of customerIds) {
    const c = await customerRepository.findById(cid);
    if (c) customerMap.set(cid, c.name);
  }
  const productMap = new Map(products.map((p) => [p.id, p.name]));

  const active = installations.filter((i) => !i.voidedAt).length;

  return (
    <>
      <PageHead
        title="Installations"
        intro={`${active} active installation${active !== 1 ? 's' : ''}${installations.length > active ? `, ${installations.length - active} voided` : ''}.`}
      >
        <Link className="c-button" data-variant="primary" href={VENDOR_ROUTES.installationsNew}>
          Record installation
        </Link>
      </PageHead>

      {installations.length === 0 ? (
        <EmptyState>No installations recorded yet. Record your first one to issue a warranty card.</EmptyState>
      ) : (
        <div className="c-admin-table">
          <table>
            <thead>
              <tr>
                <th>Warranty #</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Area</th>
                <th>Film used</th>
                <th>Installed</th>
                <th>Expires</th>
                <th>Status</th>
                <th>
                  <span className="sr-only">Actions</span>
                </th>
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
                      <strong>{inst.warrantyNumber}</strong>
                    </td>
                    <td data-label="Customer">{customerMap.get(inst.customerId) ?? '—'}</td>
                    <td data-label="Product">{productMap.get(inst.productId) ?? '—'}</td>
                    <td data-label="Area">{inst.area}</td>
                    <td data-label="Film used">{metres(inst.metresUsed)}</td>
                    <td data-label="Installed">{format.date(inst.installedAt)}</td>
                    <td data-label="Expires">{format.date(inst.warrantyExpiresAt)}</td>
                    <td data-cell="status">
                      <Pill tone={tone}>{label}</Pill>
                    </td>
                    <td>
                      {!isVoided && (
                        <a
                          href={`/api/warranty/${encodeURIComponent(inst.warrantyNumber)}/pdf`}
                          className="c-admin-more inline-flex items-center gap-1"
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Download PDF for ${inst.warrantyNumber}`}
                        >
                          <Download className="h-4 w-4" aria-hidden="true" focusable="false" />
                          PDF
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
