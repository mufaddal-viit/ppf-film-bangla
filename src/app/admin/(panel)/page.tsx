import {
  BellRing,
  CalendarDays,
  ContactRound,
  Globe,
  Inbox,
  MessageCircleHeart,
  Newspaper,
  TrendingUp,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { TrendChart } from '@/components/admin/trend-chart';
import { Avatar, EmptyState, Panel, StatusBadge } from '@/components/admin/ui';
import { fillDays } from '@/lib/admin/chart';
import {
  ADMIN_ROUTES,
  AUDIT_ACTION_LABELS,
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
  LEAD_TYPE_LABELS,
  ROLE_LABELS,
} from '@/lib/admin/constants';
import { adminDates } from '@/lib/admin/format';
import { requireSession } from '@/lib/auth/session';
import { siteConfig } from '@/lib/config';
import { auditRepository } from '@/lib/db/repositories/audit.repository';
import { customerRepository } from '@/lib/db/repositories/customer.repository';
import { leadRepository } from '@/lib/db/repositories/lead.repository';
import { postRepository } from '@/lib/db/repositories/post.repository';

export const metadata: Metadata = { title: 'Dashboard' };

const TREND_DAYS = 14;

type Tile = { label: string; value: number; href: string; icon: LucideIcon; tone?: 'primary' | 'warning' | 'success' };

export default async function AdminDashboardPage() {
  const session = await requireSession();
  const { timezone } = siteConfig.locale;
  const [stats, recent, due, customers, posts, daily, activity] = await Promise.all([
    leadRepository.stats(),
    leadRepository.list({}, { skip: 0, limit: 6 }),
    leadRepository.followUpsDue(5),
    customerRepository.stats(),
    postRepository.counts(),
    leadRepository.daily(TREND_DAYS, timezone),
    // The audit log is for the owner only, here as on its own page.
    session.role === 'owner' ? auditRepository.recent(6) : [],
  ]);
  const format = adminDates(timezone);
  const total = LEAD_STATUSES.reduce((sum, status) => sum + stats.byStatus[status], 0);
  const trend = fillDays(daily, TREND_DAYS, timezone);
  const trendTotal = trend.reduce((sum, point) => sum + point.value, 0);

  const tiles: Tile[] = [
    {
      label: 'New enquiries waiting',
      value: stats.byStatus.new,
      href: `${ADMIN_ROUTES.leads}?status=new`,
      icon: Inbox,
      tone: 'primary',
    },
    { label: 'Enquiries in the last 7 days', value: stats.last7Days, href: ADMIN_ROUTES.leads, icon: TrendingUp },
    {
      label: 'Follow-ups due',
      value: stats.followUpsDue,
      href: ADMIN_ROUTES.leads,
      icon: BellRing,
      tone: 'warning',
    },
    { label: 'Customers', value: customers.total, href: ADMIN_ROUTES.customers, icon: ContactRound },
    {
      label: 'Customers due a message',
      value: customers.due,
      href: `${ADMIN_ROUTES.customers}?segment=due`,
      icon: MessageCircleHeart,
      tone: 'warning',
    },
    { label: 'Published posts', value: posts.published, href: ADMIN_ROUTES.blog, icon: Newspaper, tone: 'success' },
  ];

  return (
    <div className="c-admin-dash">
      <div className="c-admin-stack">
        <header className="c-admin-hello">
          <div>
            <h1>Hello, {session.name.split(' ')[0]}</h1>
            <p>Enquiries, customers and the blog at a glance.</p>
          </div>
          <p className="c-admin-chip">
            <CalendarDays aria-hidden="true" focusable="false" />
            {format.date(new Date())}
          </p>
        </header>

        <ul className="c-admin-tiles">
          {tiles.map(({ icon: Icon, ...tile }) => (
            <li key={tile.label}>
              <Link href={tile.href} className="c-admin-tile" data-tone={tile.value > 0 ? tile.tone : undefined}>
                <span className="c-admin-tile-icon">
                  <Icon aria-hidden="true" focusable="false" />
                </span>
                <span>{tile.label}</span>
                <strong>{tile.value}</strong>
              </Link>
            </li>
          ))}
        </ul>

        <Panel
          title="Enquiries"
          action={
            <p className="c-admin-chip">
              {trendTotal} in the last {TREND_DAYS} days
            </p>
          }
        >
          <TrendChart points={trend} unit="enquiries" />
        </Panel>

        <Panel
          title="Latest enquiries"
          action={
            <Link href={ADMIN_ROUTES.leads} className="c-admin-more">
              All leads
            </Link>
          }
        >
          {recent.items.length === 0 ? (
            <EmptyState>No enquiries yet. They appear here as soon as someone submits a form on the site.</EmptyState>
          ) : (
            <ul className="c-admin-list">
              {recent.items.map((lead) => (
                <li key={lead.id}>
                  <Avatar name={lead.name} />
                  <Link href={`${ADMIN_ROUTES.leads}/${lead.id}`}>
                    <strong>{lead.name}</strong>
                    <span>
                      {LEAD_TYPE_LABELS[lead.type]} · {format.dateTime(lead.createdAt)}
                    </span>
                  </Link>
                  <StatusBadge status={lead.status} />
                </li>
              ))}
            </ul>
          )}
        </Panel>

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
      </div>

      <aside className="c-admin-rail" aria-label="Your account and what needs attention">
        <section className="c-admin-profile">
          <Avatar name={session.name} size="lg" />
          <h2>{session.name}</h2>
          <p>
            {ROLE_LABELS[session.role]} · {session.email}
          </p>
          <div className="c-admin-profile-actions">
            <Link href={ADMIN_ROUTES.account} aria-label="Your account" title="Your account">
              <UserRound aria-hidden="true" focusable="false" />
            </Link>
            <Link href={ADMIN_ROUTES.customersNew} aria-label="Add a customer" title="Add a customer">
              <ContactRound aria-hidden="true" focusable="false" />
            </Link>
            <Link href={ADMIN_ROUTES.blogNew} aria-label="Write a post" title="Write a post">
              <Newspaper aria-hidden="true" focusable="false" />
            </Link>
            <a
              href={`/${siteConfig.locale.defaultLocale}`}
              target="_blank"
              rel="noopener"
              aria-label="View website"
              title="View website"
            >
              <Globe aria-hidden="true" focusable="false" />
            </a>
          </div>
        </section>

        <Panel title="Follow-ups due">
          {due.length === 0 ? (
            <EmptyState>Nothing due. Set a follow-up date on a lead to see it here on the day.</EmptyState>
          ) : (
            <ul className="c-admin-list">
              {due.map((lead) => (
                <li key={lead.id}>
                  <Avatar name={lead.name} />
                  <Link href={`${ADMIN_ROUTES.leads}/${lead.id}`}>
                    <strong>{lead.name}</strong>
                    <span>Due {lead.followUpAt ? format.day(lead.followUpAt) : ''}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {session.role === 'owner' && (
          <Panel
            title="Activity"
            action={
              <Link href={ADMIN_ROUTES.activity} className="c-admin-more">
                See all
              </Link>
            }
          >
            {activity.length === 0 ? (
              <EmptyState>Nothing recorded yet.</EmptyState>
            ) : (
              <ul className="c-admin-feed">
                {activity.map((entry) => (
                  <li key={entry.id}>
                    <Avatar name={entry.actorEmail} />
                    <div>
                      <strong>{AUDIT_ACTION_LABELS[entry.action] ?? entry.action}</strong>
                      <span>
                        {entry.actorEmail} · {format.dateTime(entry.at)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        )}
      </aside>
    </div>
  );
}
