import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState, PageHead, Panel, StatusBadge } from '@/components/admin/ui';
import { ADMIN_ROUTES, LEAD_STATUSES, LEAD_STATUS_LABELS } from '@/lib/admin/constants';
import { adminDates } from '@/lib/admin/format';
import { requireSession } from '@/lib/auth/session';
import { siteConfig } from '@/lib/config';
import { leadRepository } from '@/lib/db/repositories/lead.repository';

export const metadata: Metadata = { title: 'Dashboard' };

export default async function AdminDashboardPage() {
  const session = await requireSession();
  const [stats, recent, due] = await Promise.all([
    leadRepository.stats(),
    leadRepository.list({}, { skip: 0, limit: 6 }),
    leadRepository.followUpsDue(6),
  ]);
  const format = adminDates(siteConfig.locale.timezone);
  const total = LEAD_STATUSES.reduce((sum, status) => sum + stats.byStatus[status], 0);

  const tiles = [
    { label: 'New in the last 24 hours', value: stats.last24Hours },
    { label: 'New in the last 7 days', value: stats.last7Days },
    { label: 'Open enquiries', value: stats.open },
    { label: 'Follow-ups due', value: stats.followUpsDue },
  ];

  return (
    <>
      <PageHead title={`Welcome, ${session.name.split(' ')[0]}`} intro="Enquiries from the website at a glance." />

      <ul className="c-admin-tiles">
        {tiles.map((tile) => (
          <li key={tile.label} className="c-admin-tile">
            <strong>{tile.value}</strong>
            <span>{tile.label}</span>
          </li>
        ))}
      </ul>

      <div className="c-admin-columns">
        <Panel title="Latest enquiries">
          {recent.items.length === 0 ? (
            <EmptyState>No enquiries yet. They appear here as soon as someone submits a form on the site.</EmptyState>
          ) : (
            <ul className="c-admin-list">
              {recent.items.map((lead) => (
                <li key={lead.id}>
                  <Link href={`${ADMIN_ROUTES.leads}/${lead.id}`}>
                    <strong>{lead.name}</strong>
                    <span>{format.dateTime(lead.createdAt)}</span>
                  </Link>
                  <StatusBadge status={lead.status} />
                </li>
              ))}
            </ul>
          )}
          <Link href={ADMIN_ROUTES.leads} className="c-admin-more">
            All leads
          </Link>
        </Panel>

        <Panel title="Follow-ups due">
          {due.length === 0 ? (
            <EmptyState>Nothing due. Set a follow-up date on a lead to see it here on the day.</EmptyState>
          ) : (
            <ul className="c-admin-list">
              {due.map((lead) => (
                <li key={lead.id}>
                  <Link href={`${ADMIN_ROUTES.leads}/${lead.id}`}>
                    <strong>{lead.name}</strong>
                    <span>Due {lead.followUpAt ? format.day(lead.followUpAt) : ''}</span>
                  </Link>
                  <StatusBadge status={lead.status} />
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel title="Enquiries by status">
        <ul className="c-admin-bars">
          {LEAD_STATUSES.map((status) => (
            <li key={status}>
              <Link href={`${ADMIN_ROUTES.leads}?status=${status}`}>{LEAD_STATUS_LABELS[status]}</Link>
              <span className="c-admin-bar" data-status={status}>
                <span style={{ width: `${total ? (stats.byStatus[status] / total) * 100 : 0}%` }} />
              </span>
              <strong>{stats.byStatus[status]}</strong>
            </li>
          ))}
        </ul>
      </Panel>
    </>
  );
}
