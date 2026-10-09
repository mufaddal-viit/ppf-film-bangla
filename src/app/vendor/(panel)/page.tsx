import { CalendarDays } from 'lucide-react';
import type { Metadata } from 'next';
import { Avatar, EmptyState, Panel } from '@/components/admin/ui';
import { adminDates } from '@/lib/admin/format';
import { siteConfig } from '@/lib/config';
import { requireVendorSession } from '@/lib/vendor/session';

export const metadata: Metadata = { title: 'Dashboard' };

export default async function VendorDashboardPage() {
  const { name, vendor } = await requireVendorSession();
  const format = adminDates(siteConfig.locale.timezone);

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

      <Panel title="Your products">
        <EmptyState>
          No products have been allocated to your shop yet. Film that {siteConfig.business.name} allocates to you will
          appear here.
        </EmptyState>
      </Panel>
    </div>
  );
}
