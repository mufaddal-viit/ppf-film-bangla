import { LogOut } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { vendorLogout } from '@/app/actions/vendor';
import { AdminNav, type AdminNavGroup } from '@/components/admin/admin-nav';
import { AdminShell } from '@/components/admin/admin-shell';
import { Avatar } from '@/components/admin/ui';
import { siteConfig } from '@/lib/config';
import { VENDOR_ROUTES } from '@/lib/vendor/constants';
import { requireVendorSession } from '@/lib/vendor/session';

/**
 * Vendor portal shell. The session check here only decides what the shell shows; every page and
 * every action checks the session again, because layouts do not re-run on navigation.
 */
export default async function VendorPanelLayout({ children }: { children: ReactNode }) {
  // The account page must stay reachable on a temporary password; every other page redirects there itself.
  const session = await requireVendorSession({ allowTemporaryPassword: true });
  const { name, logo } = siteConfig.business;

  const groups: AdminNavGroup[] = [
    {
      links: [
        { href: VENDOR_ROUTES.dashboard, label: 'Dashboard', icon: 'dashboard' },
        { href: VENDOR_ROUTES.installations, label: 'Installations', icon: 'installations' },
        { href: VENDOR_ROUTES.stock, label: 'Stock', icon: 'stock' },
      ],
    },
    { label: 'You', links: [{ href: VENDOR_ROUTES.account, label: 'Account', icon: 'account' }] },
  ];

  return (
    <div className="c-admin">
      <AdminShell
        label="Vendor portal menu"
        brand={
          <Link
            href={VENDOR_ROUTES.dashboard}
            className="c-admin-brand"
            aria-label={`${name} vendor portal, dashboard`}
          >
            <Image src={logo.src} alt={name} width={logo.width} height={logo.height} priority />
          </Link>
        }
        barEnd={
          <Link
            href={VENDOR_ROUTES.account}
            className="c-admin-bar-account"
            aria-label={`Your account, ${session.name}`}
          >
            <Avatar name={session.name} />
          </Link>
        }
      >
        <Link href={VENDOR_ROUTES.dashboard} className="c-admin-brand" aria-label={`${name} vendor portal, dashboard`}>
          <Image src={logo.src} alt={name} width={logo.width} height={logo.height} priority />
        </Link>
        <AdminNav groups={groups} rootHref={VENDOR_ROUTES.dashboard} label="Vendor portal" />
        <div className="c-admin-user">
          <Link href={VENDOR_ROUTES.account}>
            <Avatar name={session.name} />
            <span>
              <strong>{session.name}</strong>
              <small>{session.vendor.shopName}</small>
            </span>
          </Link>
          <form action={vendorLogout}>
            <button type="submit" aria-label="Sign out" title="Sign out">
              <LogOut aria-hidden="true" focusable="false" />
            </button>
          </form>
        </div>
      </AdminShell>
      <main className="c-admin-main">{children}</main>
    </div>
  );
}
