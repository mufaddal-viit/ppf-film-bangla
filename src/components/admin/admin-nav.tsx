'use client';

import {
  Boxes,
  ClipboardCheck,
  ContactRound,
  History,
  Inbox,
  KeyRound,
  LayoutDashboard,
  Newspaper,
  Package,
  Store,
  UserCog,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ICONS = {
  dashboard: LayoutDashboard,
  leads: Inbox,
  customers: ContactRound,
  blog: Newspaper,
  products: Package,
  vendors: Store,
  stock: Boxes,
  installations: ClipboardCheck,
  account: KeyRound,
  users: UserCog,
  activity: History,
} satisfies Record<string, LucideIcon>;

export type AdminNavGroup = {
  label?: string;
  links: Array<{ href: string; label: string; icon: keyof typeof ICONS; count?: number }>;
};

type AdminNavProps = { groups: AdminNavGroup[]; rootHref: string; label?: string };

/** Sidebar links. The dashboard matches only its own path; every other link also matches its sub-pages. */
export function AdminNav({ groups, rootHref, label = 'Admin' }: AdminNavProps) {
  const pathname = usePathname();
  const isCurrent = (href: string) => (href === rootHref ? pathname === href : pathname.startsWith(href));

  return (
    <nav className="c-admin-nav" aria-label={label}>
      {groups.map((group, index) => (
        <div key={group.label ?? index} className="c-admin-nav-group">
          {group.label && <p className="c-admin-nav-label">{group.label}</p>}
          {group.links.map((link) => {
            const Icon = ICONS[link.icon];
            return (
              <Link key={link.href} href={link.href} aria-current={isCurrent(link.href) ? 'page' : undefined}>
                <Icon aria-hidden="true" focusable="false" />
                <span>{link.label}</span>
                {link.count ? <span className="c-admin-nav-count">{link.count}</span> : null}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
