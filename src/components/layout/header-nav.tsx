'use client';

import {
  ArrowRight,
  ArrowUpRight,
  Award,
  CheckCircle2,
  ChevronDown,
  Menu,
  Phone,
  Shield,
  Sparkles,
  Sun,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { useEffect, useId, useRef, useState } from 'react';
import { WhatsAppIcon } from '@/components/icons/brand';
import { Icon } from '@/components/ui/icon';
import { Link, usePathname } from '@/i18n/navigation';
import type { NavItem, SiteView } from '@/lib/content';
import type { IconName } from '@/lib/icons';

interface HeaderNavProps {
  items: NavItem[];
  labels: { nav: string; open: string; close: string; quote?: string; home?: string };
  site?: SiteView;
  whatsappUrl?: string;
}

export function HeaderNav({ items, labels, site, whatsappUrl }: HeaderNavProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [mobileAccordionOpen, setMobileAccordionOpen] = useState(true);
  const pathname = usePathname();
  const menuId = useId();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Close menus on route change
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setDrawerOpen(false);
    setProductsOpen(false);
  }

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDrawerOpen(false);
        setProductsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  // Desktop hover delay handlers so cursor travel doesn't glitch
  const handleMouseEnterProducts = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setProductsOpen(true);
  };

  const handleMouseLeaveProducts = () => {
    timeoutRef.current = setTimeout(() => {
      setProductsOpen(false);
    }, 180);
  };

  return (
    <>
      {/* ========================================================
          DESKTOP NAVIGATION (Screen >= lg)
          Floating Aero-Crystal Capsule with Specular Reflections
      ======================================================== */}
      <nav aria-label={labels.nav} className="c-desktop-nav relative hidden items-center lg:flex">
        <ul className="c-desktop-nav-list">
          {items.map((item) => {
            const current = pathname === item.href;
            const hasChildren = Boolean(item.children && item.children.length > 0);
            const inSection = current || (hasChildren && item.children!.some((child) => pathname === child.href));

            // 1. PRODUCTS SUB-NAV (Mega-Menu)
            if (hasChildren) {
              const ppfItems = item.children!.filter((c) => c.category === 'ppf');
              const windowItems = item.children!.filter((c) => c.category === 'window-film');
              const allServicesItem =
                item.children!.find((c) => c.category === 'general' || c.href.endsWith('/services')) ??
                item.children![0];

              return (
                <li
                  key={item.href}
                  className="static"
                  onMouseEnter={handleMouseEnterProducts}
                  onMouseLeave={handleMouseLeaveProducts}
                >
                  <button
                    type="button"
                    className={`c-nav-pill ${inSection || productsOpen ? 'is-active' : ''}`}
                    aria-expanded={productsOpen}
                    aria-haspopup="true"
                    onClick={() => setProductsOpen((v) => !v)}
                  >
                    <span>{item.label}</span>
                    <ChevronDown
                      className={`size-3.5 transition-transform duration-200 ${
                        productsOpen ? 'rotate-180 text-primary' : 'text-muted-foreground'
                      }`}
                      aria-hidden="true"
                    />
                  </button>

                  {/* Mega-Menu Panel */}
                  <div
                    className={`c-desktop-dropdown ${productsOpen ? 'is-visible' : ''}`}
                    role="region"
                    aria-label={item.label}
                  >
                    {/* Top Specular Rim */}
                    <div className="c-glass-rim" />

                    <div className="c-dropdown-grid grid grid-cols-2 gap-6 p-6">
                      {/* Left Column: Paint Protection Film */}
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between border-b border-border/50 pb-2">
                          <span className="flex items-center gap-2 text-xs font-bold tracking-wider text-foreground uppercase">
                            <span className="flex size-6 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary">
                              <Shield className="size-3.5" />
                            </span>
                            Paint Protection Film
                          </span>
                          <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[0.68rem] font-bold text-primary">
                            {ppfItems.length} Series
                          </span>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          {ppfItems.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className="c-menu-item-card group flex items-start gap-3"
                              aria-current={pathname === child.href ? 'page' : undefined}
                              onClick={() => setProductsOpen(false)}
                            >
                              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-surface/90 text-muted-foreground shadow-xs transition-all group-hover:border-primary/40 group-hover:bg-primary/10 group-hover:text-primary">
                                {child.icon ? (
                                  <Icon name={child.icon as IconName} className="size-4" />
                                ) : (
                                  <Sparkles className="size-4" />
                                )}
                              </div>
                              <div className="min-w-0 grow">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                                    {child.label}
                                  </span>
                                  {child.badge && <span className="c-badge-pill">{child.badge}</span>}
                                </div>
                                {child.description && (
                                  <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                                    {child.description}
                                  </p>
                                )}
                              </div>
                              <ArrowRight className="size-3 shrink-0 -translate-x-1 self-center text-muted-foreground opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 rtl:rotate-180" />
                            </Link>
                          ))}
                        </div>
                      </div>

                      {/* Right Column: Ceramic Window Film & Studio Standards */}
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between border-b border-border/50 pb-2">
                          <span className="flex items-center gap-2 text-xs font-bold tracking-wider text-foreground uppercase">
                            <span className="flex size-6 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary">
                              <Sun className="size-3.5" />
                            </span>
                            Ceramic Window Film
                          </span>
                          <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[0.68rem] font-bold text-primary">
                            {windowItems.length} Series
                          </span>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          {windowItems.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className="c-menu-item-card group flex items-start gap-3"
                              aria-current={pathname === child.href ? 'page' : undefined}
                              onClick={() => setProductsOpen(false)}
                            >
                              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-surface/90 text-muted-foreground shadow-xs transition-all group-hover:border-primary/40 group-hover:bg-primary/10 group-hover:text-primary">
                                {child.icon ? (
                                  <Icon name={child.icon as IconName} className="size-4" />
                                ) : (
                                  <Sun className="size-4" />
                                )}
                              </div>
                              <div className="min-w-0 grow">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                                    {child.label}
                                  </span>
                                  {child.badge && <span className="c-badge-pill">{child.badge}</span>}
                                </div>
                                {child.description && (
                                  <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                                    {child.description}
                                  </p>
                                )}
                              </div>
                              <ArrowRight className="size-3 shrink-0 -translate-x-1 self-center text-muted-foreground opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 rtl:rotate-180" />
                            </Link>
                          ))}
                        </div>

                        {/* Studio Cleanroom Standards Micro-Card */}
                        <div className="mt-auto space-y-2 rounded-xl border border-primary/20 bg-primary/5 p-3.5 text-xs">
                          <div className="flex items-center gap-1.5 font-bold text-foreground">
                            <Award className="size-3.5 text-primary" />
                            <span>Studio Quality Standards</span>
                          </div>
                          <div className="space-y-1.5 text-muted-foreground">
                            <p className="flex items-center gap-2">
                              <CheckCircle2 className="size-3 shrink-0 text-primary" />
                              <span>100% digital CAD patterns (zero blade contact)</span>
                            </p>
                            <p className="flex items-center gap-2">
                              <CheckCircle2 className="size-3 shrink-0 text-primary" />
                              <span>Certified dust-free cleanroom installation</span>
                            </p>
                            <p className="flex items-center gap-2">
                              <CheckCircle2 className="size-3 shrink-0 text-primary" />
                              <span>Up to 10-year official manufacturer warranty</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Strip */}
                    <div className="flex items-center justify-between border-t border-border/50 bg-foreground/[0.02] px-6 py-3">
                      {allServicesItem && (
                        <Link
                          href={allServicesItem.href}
                          className="flex items-center gap-1.5 text-xs font-semibold text-foreground transition-colors hover:text-primary"
                          onClick={() => setProductsOpen(false)}
                        >
                          <span>{allServicesItem.label}</span>
                          <ArrowRight className="size-3.5 rtl:rotate-180" />
                        </Link>
                      )}

                      {whatsappUrl && (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-xs font-semibold text-success hover:underline"
                        >
                          <span className="relative flex size-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                            <span className="relative inline-flex size-2 rounded-full bg-success" />
                          </span>
                          <WhatsAppIcon className="size-3.5" />
                          <span>WhatsApp Studio Concierge</span>
                        </a>
                      )}
                    </div>
                  </div>
                </li>
              );
            }

            // 2. DIRECT NAV PILL (About, Contact, etc.)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`c-nav-pill ${current ? 'is-active' : ''}`}
                  aria-current={current ? 'page' : undefined}
                >
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ========================================================
          MOBILE HAMBURGER TRIGGER BUTTON (Screen < lg)
      ======================================================== */}
      <button
        type="button"
        className="c-mobile-hamburger-btn flex size-10 items-center justify-center rounded-full border border-border/80 bg-surface/80 text-foreground shadow-xs transition-colors hover:bg-muted lg:hidden"
        aria-label={labels.open}
        aria-expanded={drawerOpen}
        aria-controls={menuId}
        onClick={() => setDrawerOpen(true)}
      >
        <Menu className="size-5" aria-hidden="true" />
      </button>

      {/* ========================================================
          MOBILE DRAWER SHEET (Screen < lg)
      ======================================================== */}
      {/* Backdrop Overlay */}
      <div
        className={`c-mobile-backdrop fixed inset-0 z-50 transition-opacity duration-300 lg:hidden ${
          drawerOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* Slide-in Sheet */}
      <div
        id={menuId}
        className={`c-mobile-sheet fixed inset-y-0 end-0 z-50 flex w-full flex-col border-s border-border transition-transform duration-300 ease-out sm:max-w-md lg:hidden ${
          drawerOpen ? 'translate-x-0' : 'translate-x-full rtl:-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={labels.nav}
      >
        {/* Drawer Header with Logo and Circular Close Button */}
        <div className="flex shrink-0 items-center justify-between border-b border-border/80 bg-background px-6 py-4">
          {site && (
            <Link
              href="/"
              className="flex items-center gap-2"
              onClick={() => setDrawerOpen(false)}
              aria-label={site.name}
            >
              <Image
                src={site.logo.src}
                alt={site.name}
                width={site.logo.width}
                height={site.logo.height}
                className="h-8 w-auto"
              />
            </Link>
          )}

          {/* Prominent Circular Close Button */}
          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-full border border-border bg-muted/80 text-foreground shadow-xs transition-all hover:border-foreground/40 hover:bg-muted focus:ring-2 focus:ring-primary focus:outline-none"
            aria-label={labels.close}
            onClick={() => setDrawerOpen(false)}
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        {/* Drawer Body - Scrollable Navigation Links */}
        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4 pb-12">
          <ul className="flex flex-col divide-y divide-border/50">
            {items.map((item) => {
              const current = pathname === item.href;
              const hasChildren = Boolean(item.children && item.children.length > 0);

              if (!hasChildren) {
                return (
                  <li key={item.href} className="py-2.5">
                    <Link
                      href={item.href}
                      className={`flex items-center justify-between py-1.5 text-base font-semibold transition-colors ${
                        current ? 'text-primary' : 'text-foreground hover:text-primary'
                      }`}
                      aria-current={current ? 'page' : undefined}
                      onClick={() => setDrawerOpen(false)}
                    >
                      <div>
                        <span>{item.label}</span>
                        {item.href === '/about' && (
                          <p className="text-xs font-normal text-muted-foreground">
                            Studio Story & Cleanroom Standards
                          </p>
                        )}
                        {item.href === '/contact' && (
                          <p className="text-xs font-normal text-muted-foreground">Concierge, Hours & Directions</p>
                        )}
                      </div>
                      <ArrowUpRight className="size-4 text-muted-foreground rtl:-scale-x-100" />
                    </Link>
                  </li>
                );
              }

              return (
                <li key={item.href} className="py-2.5">
                  <div className="flex items-center justify-between py-1.5">
                    <Link
                      href={item.href}
                      className={`text-base font-semibold transition-colors ${
                        current ? 'text-primary' : 'text-foreground hover:text-primary'
                      }`}
                      onClick={() => setDrawerOpen(false)}
                    >
                      {item.label}
                    </Link>
                    <button
                      type="button"
                      className="flex size-9 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground transition-colors hover:text-foreground"
                      aria-expanded={mobileAccordionOpen}
                      aria-label={`${item.label} submenu`}
                      onClick={() => setMobileAccordionOpen((v) => !v)}
                    >
                      <ChevronDown
                        className={`size-4 transition-transform duration-200 ${
                          mobileAccordionOpen ? 'rotate-180 text-primary' : ''
                        }`}
                      />
                    </button>
                  </div>

                  {/* Mobile Collapsible Submenu */}
                  {mobileAccordionOpen && (
                    <div className="mt-2 space-y-1.5 border-s-2 border-border/80 ps-2">
                      {item.children!.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="flex items-center justify-between rounded-lg bg-surface/50 p-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                          onClick={() => setDrawerOpen(false)}
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            <span className="truncate">{child.label}</span>
                            {child.badge && (
                              <span className="c-badge-pill py-0.2 px-1.5 text-[0.62rem]">{child.badge}</span>
                            )}
                          </div>
                          <ArrowRight className="size-3.5 shrink-0 text-muted-foreground rtl:rotate-180" />
                        </Link>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Drawer Footer - Contact Quick Actions */}
        <div className="shrink-0 space-y-3 border-t border-border/80 bg-surface p-6">
          {site?.phone && (
            <a
              href={`tel:${site.phone.e164}`}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface py-2.5 text-sm font-semibold text-foreground shadow-xs transition-colors hover:bg-muted"
            >
              <Phone className="size-4 text-primary" />
              <span dir="ltr">{site.phone.display}</span>
            </a>
          )}

          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-success/30 bg-success/10 py-2.5 text-sm font-semibold text-success shadow-xs transition-colors hover:bg-success/20"
            >
              <WhatsAppIcon className="size-4" />
              <span>WhatsApp Studio</span>
            </a>
          )}

          <Link
            href="/contact"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-md transition-colors hover:bg-primary/90"
            onClick={() => setDrawerOpen(false)}
          >
            <span>{labels.quote ?? 'Contact Us'}</span>
            <ArrowUpRight className="size-4 rtl:-scale-x-100" />
          </Link>
        </div>
      </div>
    </>
  );
}
