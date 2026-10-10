import { CalendarDays } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Avatar, EmptyState, Panel } from '@/components/admin/ui';
import { adminDates, metres } from '@/lib/admin/format';
import { stockTotals } from '@/lib/admin/roll-rows';
import { siteConfig } from '@/lib/config';
import { productRepository } from '@/lib/db/repositories/product.repository';
import { rollRepository } from '@/lib/db/repositories/roll.repository';
import { VENDOR_ROUTES } from '@/lib/vendor/constants';
import { requireVendorSession } from '@/lib/vendor/session';

export const metadata: Metadata = { title: 'Dashboard' };

export default async function VendorDashboardPage() {
  const { name, vendor, vendorId } = await requireVendorSession();
  const [rolls, products] = await Promise.all([rollRepository.listForVendor(vendorId), productRepository.list()]);
  const format = adminDates(siteConfig.locale.timezone);
  const stockByProduct = products
    .map((product) => ({
      product: product.name,
      totals: stockTotals(rolls.filter((roll) => roll.productId === product.id)),
    }))
    .filter(({ totals }) => totals.rolls > 0);

  return (
    <div className="c-admin-stack">
      <header className="c-admin-hello">
        <div>
          <h1>Hello, {name.split(' ')[0]}</h1>
          <p>{vendor.shopName}</p>
        </div>
        <p className="c-admin-chip">
          <CalendarDays aria-hidden="true" focusable="false" />
          {format.date(new Date())}
        </p>
      </header>

      <div className="c-admin-columns">
        <Panel title="Your shop">
          <dl className="c-admin-details">
            <div>
              <dt>Shop name</dt>
              <dd>{vendor.shopName}</dd>
            </div>
            <div>
              <dt>Contact person</dt>
              <dd>{vendor.contactName}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{vendor.email}</dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd dir="ltr">{vendor.phone}</dd>
            </div>
            <div>
              <dt>Address</dt>
              <dd>{vendor.address}</dd>
            </div>
          </dl>
          <p className="c-admin-muted">
            These details are printed on every warranty card. Ask {siteConfig.business.name} to correct anything that is
            wrong.
          </p>
        </Panel>

        <Panel title="Installers">
          {vendor.installers.length === 0 ? (
            <EmptyState>
              No installers listed yet. Ask {siteConfig.business.name} to add the people who fit film at your shop.
            </EmptyState>
          ) : (
            <ul className="c-admin-list">
              {vendor.installers.map((installer) => (
                <li key={installer}>
                  <Avatar name={installer} />
                  <strong>{installer}</strong>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel
        title="Your stock"
        action={
          rolls.length > 0 && (
            <Link href={VENDOR_ROUTES.stock} className="c-admin-more">
              See every roll
            </Link>
          )
        }
      >
        {rolls.length === 0 ? (
          <EmptyState>
            No film has been allocated to your shop yet. Film that {siteConfig.business.name} allocates to you will
            appear here.
          </EmptyState>
        ) : (
          <dl className="c-admin-details">
            {stockByProduct.map(({ product, totals }) => (
              <div key={product}>
                <dt>{product}</dt>
                <dd>
                  {metres(totals.leftM)} left on {totals.rolls} {totals.rolls === 1 ? 'roll' : 'rolls'}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </Panel>
    </div>
  );
}
