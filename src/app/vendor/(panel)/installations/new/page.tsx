import type { Metadata } from 'next';
import Link from 'next/link';
import { recordInstallation } from '@/app/actions/vendor';
import { AdminForm } from '@/components/admin/admin-form';
import { InstallationFields } from '@/components/admin/installation-fields';
import { EmptyState, PageHead, Panel } from '@/components/admin/ui';
import { rollRemaining } from '@/lib/admin/format';
import { siteConfig } from '@/lib/config';
import { customerRepository } from '@/lib/db/repositories/customer.repository';
import { productRepository } from '@/lib/db/repositories/product.repository';
import { rollRepository } from '@/lib/db/repositories/roll.repository';
import { VENDOR_ROUTES } from '@/lib/vendor/constants';
import { requireVendorSession } from '@/lib/vendor/session';

export const metadata: Metadata = { title: 'Record installation' };

export default async function VendorNewInstallationPage() {
  const session = await requireVendorSession();
  const [rolls, products, { items: customers }] = await Promise.all([
    rollRepository.listForVendor(session.vendorId),
    productRepository.list(),
    customerRepository.listForVendor(session.vendorId, { skip: 0, limit: 500 }),
  ]);

  const productMap = new Map(products.map((p) => [p.id, p]));

  // Only rolls with film remaining.
  const availableRolls = rolls.map((r) => ({ ...r, remaining: rollRemaining(r) })).filter((r) => r.remaining > 0);

  const rollOptions = availableRolls.map((r) => {
    const product = productMap.get(r.productId);
    return {
      id: r.id,
      label: `LOT ${r.lotNumber} — ${product?.name ?? 'Unknown'} (${r.remaining} m left)`,
      productName: product?.name ?? 'Unknown',
    };
  });

  const customerOptions = customers.map((c) => ({
    id: c.id,
    label: `${c.name} (${c.phone})`,
  }));

  const vehiclesByCustomer: Record<string, Array<{ id: string; label: string }>> = {};
  for (const c of customers) {
    if (c.vehicles.length > 0) {
      vehiclesByCustomer[c.id] = c.vehicles.map((v) => ({
        id: v.id,
        label: [v.make, v.model, v.year, v.plate].filter(Boolean).join(' '),
      }));
    }
  }

  const canRecord = availableRolls.length > 0 && customers.length > 0 && session.vendor.installers.length > 0;

  return (
    <>
      <Link href={VENDOR_ROUTES.installations} className="c-admin-back">
        All installations
      </Link>
      <PageHead title="Record installation" intro="Record a completed installation to issue a warranty card." />

      {!canRecord ? (
        <EmptyState>
          {availableRolls.length === 0
            ? `No rolls with film remaining. Ask ${siteConfig.business.name} to allocate more stock.`
            : customers.length === 0
              ? 'No customers yet. Add a customer first from the Customers page.'
              : `No installers listed at your shop. Ask ${siteConfig.business.name} to add them.`}
        </EmptyState>
      ) : (
        <Panel title="Installation details" className="c-admin-narrow">
          <AdminForm action={recordInstallation} submitLabel="Record installation" className="c-admin-form-grid">
            <InstallationFields
              customers={customerOptions}
              rolls={rollOptions}
              installers={session.vendor.installers}
              vehiclesByCustomer={vehiclesByCustomer}
            />
          </AdminForm>
        </Panel>
      )}
    </>
  );
}
