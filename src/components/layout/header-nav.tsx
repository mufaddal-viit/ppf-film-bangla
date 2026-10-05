'use client';

import { ChevronDown, Menu, X } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { Link, usePathname } from '@/i18n/navigation';
import type { NavItem } from '@/lib/content';

/**
 * Main navigation: disclosure pattern for the mobile menu and the services submenu.
 * Without JavaScript every top-level link still works.
 */
export function HeaderNav({
  items,
  labels,
}: {
  items: NavItem[];
  labels: { nav: string; open: string; close: string };
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const pathname = usePathname();
  const menuId = useId();

  // Close menus after navigation.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMenuOpen(false);
    setOpenSubmenu(null);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setOpenSubmenu(null);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <nav aria-label={labels.nav} className="c-header-nav">
      <button
        type="button"
        className="c-button lg:hidden"
        aria-expanded={menuOpen}
        aria-controls={menuId}
        onClick={() => setMenuOpen((v) => !v)}
      >
        {menuOpen ? <X aria-hidden="true" className="size-5" /> : <Menu aria-hidden="true" className="size-5" />}
        <span className="sr-only">{menuOpen ? labels.close : labels.open}</span>
      </button>

      <ul
        id={menuId}
        className={`c-nav-list ${menuOpen ? 'flex' : 'hidden'} flex-col gap-2 lg:flex lg:flex-row lg:items-center lg:gap-7`}
      >
        {items.map((item) => {
          const current = pathname === item.href;
          if (!item.children) {
            return (
              <li key={item.href}>
                <Link href={item.href} aria-current={current ? 'page' : undefined}>
                  {item.label}
                </Link>
              </li>
            );
          }
          const submenuId = `${menuId}-${item.href}`;
          const expanded = openSubmenu === item.href;
          return (
            <li key={item.href} className="relative">
              <span className="inline-flex items-center gap-1">
                <Link href={item.href} aria-current={current ? 'page' : undefined}>
                  {item.label}
                </Link>
                <button
                  type="button"
                  aria-expanded={expanded}
                  aria-controls={submenuId}
                  aria-label={item.label}
                  onClick={() => setOpenSubmenu(expanded ? null : item.href)}
                >
                  <ChevronDown aria-hidden="true" className="size-4" />
                </button>
              </span>
              <ul
                id={submenuId}
                hidden={!expanded}
                className="c-submenu c-card z-20 mt-2 flex flex-col gap-2 lg:absolute lg:min-w-60"
              >
                {item.children.map((child) => (
                  <li key={child.href}>
                    <Link href={child.href} aria-current={pathname === child.href ? 'page' : undefined}>
                      {child.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
