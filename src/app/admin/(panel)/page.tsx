import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState, PageHead, Panel, StatusBadge } from '@/components/admin/ui';
import { ADMIN_ROUTES, LEAD_STATUSES, LEAD_STATUS_LABELS } from '@/lib/admin/constants';
import { adminDates } from '@/lib/admin/format';
import { requireSession } from '@/lib/auth/session';
import { siteConfig } from '@/lib/config';
import { customerRepository } from '@/lib/db/repositories/customer.repository';
import { leadRepository } from '@/lib/db/repositories/lead.repository';
import { postRepository } from '@/lib/db/repositories/post.repository';

export const metadata: Metadata = { title: 'Dashboard' };

export default async function AdminDashboardPage() {
  const session = await requireSession();
  const [stats, recent, due, customers, posts] = await Promise.all([
    leadRepository.stats(),
    leadRepository.list({}, { skip: 0, limit: 6 }),
    leadRepository.followUpsDue(6),
    customerRepository.stats(),
    postRepository.counts(),
  ]);
  const format = adminDates(siteConfig.locale.timezone);
  const total = LEAD_STATUSES.reduce((sum, status) => sum + stats.byStatus[status], 0);

  const tiles = [
    {
      label: 'New enquiries waiting',
      value: stats.byStatus.new,
      href: `${ADMIN_ROUTES.leads}?status=new`,
      tone: 'primary',
    },
    { label: 'Enquiries in the last 7 days', value: stats.last7Days, href: ADMIN_ROUTES.leads },
    { label: 'Follow-ups due', value: stats.followUpsDue, href: ADMIN_ROUTES.leads, tone: 'warning' },
    { label: 'Customers', value: customers.total, href: ADMIN_ROUTES.customers },
    { label: 'Customers due a message', value: customers.due, href: `${ADMIN_ROUTES.customers}?segment=due` },
    { label: 'Published posts', value: posts.published, href: ADMIN_ROUTES.blog, tone: 'success' },
  ];

  return (
    <>
      <PageHead title={`Welcome, ${session.name.split(' ')[0]}`} intro="Enquiries, customers and the blog at a glance.">
        <Link className="c-button" href={ADMIN_ROUTES.customersNew}>
          Add customer
        </Link>
        <Link className="c-button" data-variant="primary" href={ADMIN_ROUTES.blogNew}>
          New post
        </Link>
      </PageHead>

      <ul className="c-admin-tiles">
        {tiles.map((tile) => (
          <li key={tile.label}>
            <Link href={tile.href} className="c-admin-tile" data-tone={tile.value > 0 ? tile.tone : undefined}>
              <strong>{tile.value}</strong>
              <span>{tile.label}</span>
            </Link>
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
