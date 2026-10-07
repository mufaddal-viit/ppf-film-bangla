import Link from 'next/link';
import type { ReactNode } from 'react';
import { logout } from '@/app/actions/admin';
import { AdminNav, type AdminNavGroup } from '@/components/admin/admin-nav';
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

  const groups: AdminNavGroup[] = [
    { links: [{ href: ADMIN_ROUTES.dashboard, label: 'Dashboard' }] },
    { label: 'Sales', links: [{ href: ADMIN_ROUTES.leads, label: 'Leads', count: byStatus.new }] },
    ...(session.role === 'owner'
      ? [
          {
            label: 'Owner',
            links: [
              { href: ADMIN_ROUTES.users, label: 'Users' },
              { href: ADMIN_ROUTES.activity, label: 'Activity' },
            ],
          },
        ]
      : []),
  ];

  return (
    <div className="c-admin">
      <aside className="c-admin-side">
        <Link href={ADMIN_ROUTES.dashboard} className="c-admin-brand">
          {siteConfig.business.shortName}
        </Link>
        <AdminNav groups={groups} rootHref={ADMIN_ROUTES.dashboard} />
        <div className="c-admin-user">
          <Link href={ADMIN_ROUTES.account}>
            <strong>{session.name}</strong>
            <span>{ROLE_LABELS[session.role]}</span>
          </Link>
          <form action={logout}>
            <button type="submit">Sign out</button>
          </form>
        </div>
      </aside>
      <main className="c-admin-main">{children}</main>
    </div>
  );
}
