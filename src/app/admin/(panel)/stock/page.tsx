import type { Metadata } from 'next';
import { allocateRoll, removeRoll } from '@/app/actions/admin';
import { AdminForm } from '@/components/admin/admin-form';
import { RollFields } from '@/components/admin/roll-fields';
import { RollTable } from '@/components/admin/roll-table';
import { EmptyState, PageHead, Panel } from '@/components/admin/ui';
import { ROLL_LIMITS } from '@/lib/admin/constants';
import { adminDates, metres } from '@/lib/admin/format';
import { stockTotals, toRollRows } from '@/lib/admin/roll-rows';
import { requireSession } from '@/lib/auth/session';
import { siteConfig } from '@/lib/config';
import { productRepository } from '@/lib/db/repositories/product.repository';
import { rollRepository } from '@/lib/db/repositories/roll.repository';
import { vendorRepository } from '@/lib/db/repositories/vendor.repository';

export const metadata: Metadata = { title: 'Stock' };

export default async function AdminStockPage({ searchParams }: PageProps<'/admin/stock'>) {
  await requireSession('owner');
  const [rolls, products, vendors, query] = await Promise.all([
    rollRepository.list(),
    productRepository.list(),
    vendorRepository.list(),
    searchParams,
  ]);
  const format = adminDates(siteConfig.locale.timezone);
  const totals = stockTotals(rolls);
  const activeVendors = vendors.filter((vendor) => vendor.active);
  const activeProducts = products.filter((product) => product.active);
  const preselected = activeVendors.find((vendor) => vendor.id === query.vendor)?.id;

  return (
    <>
      <PageHead
        title="Stock"
        intro={
          totals.rolls === 0
            ? 'Rolls of film you have allocated to vendors. A vendor can only install and warrant film from these rolls.'
            : `${totals.rolls} ${totals.rolls === 1 ? 'roll' : 'rolls'} allocated, ${metres(totals.leftM)} of ${metres(totals.allocatedM)} left. A vendor can only install and warrant film from these rolls.`
        }
      />

      <div className="c-admin-stack">
        <Panel title="Allocate a roll">
          {activeVendors.length === 0 || activeProducts.length === 0 ? (
            <EmptyState>Add at least one active vendor and one product on sale before allocating stock.</EmptyState>
          ) : (
            <AdminForm action={allocateRoll} submitLabel="Allocate roll" className="c-admin-form-grid" resetOnSuccess>
              <RollFields
                vendors={activeVendors.map((vendor) => ({ id: vendor.id, label: vendor.shopName }))}
                products={activeProducts.map((product) => ({
                  id: product.id,
                  label: `${product.name} (${product.finish})`,
                }))}
                vendorId={preselected}
                limits={ROLL_LIMITS}
              />
            </AdminForm>
          )}
        </Panel>

        {rolls.length === 0 ? (
          <EmptyState>No stock allocated yet. Allocate the first roll above.</EmptyState>
        ) : (
          <RollTable rolls={toRollRows(rolls, { products, vendors, date: format.date })} removeAction={removeRoll} />
        )}
      </div>
    </>
  );
}
