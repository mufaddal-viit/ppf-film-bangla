import type { Metadata } from 'next';
import { RollTable } from '@/components/admin/roll-table';
import { EmptyState, PageHead } from '@/components/admin/ui';
import { adminDates, metres } from '@/lib/admin/format';
import { stockTotals, toRollRows } from '@/lib/admin/roll-rows';
import { siteConfig } from '@/lib/config';
import { productRepository } from '@/lib/db/repositories/product.repository';
import { rollRepository } from '@/lib/db/repositories/roll.repository';
import { requireVendorSession } from '@/lib/vendor/session';

export const metadata: Metadata = { title: 'Stock' };

export default async function VendorStockPage() {
  const { vendorId } = await requireVendorSession();
  // Filtered by the shop in the session, so one vendor can never read another's stock.
  const [rolls, products] = await Promise.all([rollRepository.listForVendor(vendorId), productRepository.list()]);
  const format = adminDates(siteConfig.locale.timezone);
  const totals = stockTotals(rolls);

  return (
    <>
      <PageHead
        title="Stock"
        intro={
          totals.rolls === 0
            ? `Film that ${siteConfig.business.name} has allocated to your shop.`
            : `${totals.rolls} ${totals.rolls === 1 ? 'roll' : 'rolls'}, ${metres(totals.leftM)} of ${metres(totals.allocatedM)} left.`
        }
      />
      {rolls.length === 0 ? (
        <EmptyState>
          No film has been allocated to your shop yet. Ask {siteConfig.business.name} to allocate the rolls you hold.
        </EmptyState>
      ) : (
        <RollTable rolls={toRollRows(rolls, { products, date: format.date })} />
      )}
    </>
  );
}
