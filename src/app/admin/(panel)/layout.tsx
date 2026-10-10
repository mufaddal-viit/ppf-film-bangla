import { ArrowUpRight, LogOut } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { logout } from '@/app/actions/admin';
import { AdminNav, type AdminNavGroup } from '@/components/admin/admin-nav';
import { Avatar } from '@/components/admin/ui';
import { ADMIN_ROUTES, ROLE_LABELS } from '@/lib/admin/constants';
import { requireSession } from '@/lib/auth/session';
import { siteConfig } from '@/lib/config';
import { leadRepository } from '@/lib/db/repositories/lead.repository';

/**
 * Admin shell: sidebar and signed-in user. The session check here only decides what the shell shows;
 * every page and every action checks the session again, because layouts do not re-run on navigation.
 */
export default async function AdminPanelLayout({ children }: { children: ReactNode }) {
  const session = await requireSession();
  const { byStatus } = await leadRepository.stats();
  const { name, logo } = siteConfig.business;

  const groups: AdminNavGroup[] = [
    { links: [{ href: ADMIN_ROUTES.dashboard, label: 'Dashboard', icon: 'dashboard' }] },
    {
      label: 'Sales',
      links: [
        { href: ADMIN_ROUTES.leads, label: 'Leads', icon: 'leads', count: byStatus.new },
        { href: ADMIN_ROUTES.customers, label: 'Customers', icon: 'customers' },
      ],
    },
    { label: 'Website', links: [{ href: ADMIN_ROUTES.blog, label: 'Blog', icon: 'blog' }] },
    ...(session.role === 'owner'
      ? [
          {
            label: 'Warranty',
            links: [
              { href: ADMIN_ROUTES.products, label: 'Products', icon: 'products' as const },
              { href: ADMIN_ROUTES.vendors, label: 'Vendors', icon: 'vendors' as const },
              { href: ADMIN_ROUTES.stock, label: 'Stock', icon: 'stock' as const },
            ],
          },
        ]
      : []),
    ...(session.role === 'owner'
      ? [
          {
            label: 'Owner',
            links: [
              { href: ADMIN_ROUTES.users, label: 'Users', icon: 'users' as const },
              { href: ADMIN_ROUTES.activity, label: 'Activity', icon: 'activity' as const },
            ],
          },
        ]
      : []),
  ];

  return (
    <div className="c-admin">
      <aside className="c-admin-side">
        <Link href={ADMIN_ROUTES.dashboard} className="c-admin-brand" aria-label={`${name} admin, dashboard`}>
          <Image src={logo.src} alt={name} width={logo.width} height={logo.height} priority />
        </Link>
        <AdminNav groups={groups} rootHref={ADMIN_ROUTES.dashboard} />
        <a className="c-admin-site-card" href={`/${siteConfig.locale.defaultLocale}`} target="_blank" rel="noopener">
          <Image src="/images/showcase/2.jpg" alt="" width={416} height={234} sizes="13rem" />
          <strong>Your website</strong>
          <span>See what customers see.</span>
          <span className="c-admin-site-card-cta">
            View website
            <ArrowUpRight aria-hidden="true" focusable="false" />
          </span>
        </a>
        <div className="c-admin-user">
          <Link href={ADMIN_ROUTES.account}>
            <Avatar name={session.name} />
            <span>
              <strong>{session.name}</strong>
              <small>{ROLE_LABELS[session.role]}</small>
            </span>
          </Link>
          <form action={logout}>
            <button type="submit" aria-label="Sign out" title="Sign out">
              <LogOut aria-hidden="true" focusable="false" />
            </button>
          </form>
        </div>
      </aside>
      <main className="c-admin-main">{children}</main>
    </div>
  );
}
