'use client';

import { ArrowRight, ArrowUpRight, ChevronDown, Menu, Phone, Sparkles, X } from 'lucide-react';
import Image from 'next/image';
import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type KeyboardEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { WhatsAppIcon } from '@/components/icons/brand';
import { Icon } from '@/components/ui/icon';
import { TrackedLink } from '@/components/ui/tracked-link';
import { Link, usePathname } from '@/i18n/navigation';
import type { NavItem, NavLink, SiteView } from '@/lib/content';
import type { IconName } from '@/lib/icons';

type Group = 'ppf' | 'window-film';

export type HeaderLabels = {
  nav: string;
  open: string;
  close: string;
  quote: string;
  home: string;
  call: string;
  whatsapp: string;
  /** Headings for the two film families in the products menu. */
  groups: Record<Group, string>;
};

type HeaderNavProps = {
  items: NavItem[];
  labels: HeaderLabels;
  site: Pick<SiteView, 'name' | 'logo' | 'phone'>;
  whatsappUrl?: string;
  showQuoteButton: boolean;
};

const GROUPS: Group[] = ['ppf', 'window-film'];

/** Splits a products item into the two film families and the "all products" link. */
function productGroups(item: NavItem) {
  const children = item.children ?? [];
  return {
    groups: GROUPS.map((key) => ({ key, links: children.filter((c) => c.category === key) })).filter(
      (g) => g.links.length > 0,
    ),
    all: children.find((c) => c.category === 'general'),
  };
}

/** The portal target only exists in the browser; this is false during the server render. */
const useIsClient = () =>
  useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

/** Desktop links with the products menu, plus the phone menu button and the full-screen phone menu. */
export function HeaderNav({ items, labels, site, whatsappUrl, showQuoteButton }: HeaderNavProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);

  // Close both menus after navigating.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMenuOpen(false);
    setProductsOpen(false);
  }

  return (
    <>
      <nav aria-label={labels.nav} className="c-header-nav">
        <ul>
          {items.map((item) =>
            item.children?.length ? (
              <ProductsMenu
                key={item.href}
                item={item}
                labels={labels}
                pathname={pathname}
                open={productsOpen}
                setOpen={setProductsOpen}
              />
            ) : (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="c-header-link"
                  aria-current={pathname === item.href ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ),
          )}
        </ul>
      </nav>

      <MobileMenu
        items={items}
        labels={labels}
        site={site}
        whatsappUrl={whatsappUrl}
        showQuoteButton={showQuoteButton}
        pathname={pathname}
        open={menuOpen}
        setOpen={setMenuOpen}
      />
    </>
  );
}

// ---------------------------------------------------------------- desktop products menu

function ProductsMenu({
  item,
  labels,
  pathname,
  open,
  setOpen,
}: {
  item: NavItem;
  labels: HeaderLabels;
  pathname: string;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const { groups, all } = productGroups(item);
  const first = groups[0]?.links[0];
  const [preview, setPreview] = useState<NavLink | undefined>(first);
  const panelId = useId();
  const rootRef = useRef<HTMLLIElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inSection = item.children!.some((child) => pathname === child.href);

  // A short delay before closing, so moving the pointer from the button down to the panel never drops it.
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };
  const closeSoon = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 160);
  };
  useEffect(() => cancelClose, []);

  // Clicking anywhere else closes it.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open, setOpen]);

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && open) {
      setOpen(false);
      buttonRef.current?.focus();
    }
  };

  return (
    <li
      ref={rootRef}
      className="c-header-products"
      onPointerEnter={(e) => {
        if (e.pointerType !== 'mouse') return;
        cancelClose();
        setOpen(true);
      }}
      onPointerLeave={(e) => e.pointerType === 'mouse' && closeSoon()}
      onKeyDown={onKeyDown}
      onBlur={(e) => {
        if (!rootRef.current?.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        className="c-header-link"
        data-current={inSection || undefined}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(!open)}
      >
        {item.label}
        <ChevronDown aria-hidden="true" className="c-header-chevron" />
      </button>

      <div id={panelId} className="c-mega" data-open={open || undefined}>
        <div className="c-mega-groups">
          {groups.map((group) => (
            <section key={group.key} aria-labelledby={`${panelId}-${group.key}`}>
              <h2 id={`${panelId}-${group.key}`}>{labels.groups[group.key]}</h2>
              <ul>
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="c-mega-item"
                      aria-current={pathname === link.href ? 'page' : undefined}
                      data-previewed={preview?.href === link.href || undefined}
                      onPointerEnter={() => setPreview(link)}
                      onFocus={() => setPreview(link)}
                      onClick={() => setOpen(false)}
                    >
                      <span className="c-mega-icon">
                        {link.icon ? <Icon name={link.icon as IconName} /> : <Sparkles aria-hidden="true" />}
                      </span>
                      <span className="c-mega-text">
                        <span className="c-mega-name">
                          {link.label}
                          {link.badge && <span className="c-badge-pill">{link.badge}</span>}
                        </span>
                        {link.description && <span className="c-mega-desc">{link.description}</span>}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        {preview && (
          <aside className="c-mega-preview" aria-hidden="true">
            {preview.image && (
              <Image key={preview.href} src={preview.image} alt="" width={480} height={320} sizes="18rem" />
            )}
            <div>
              <strong>{preview.label}</strong>
              {preview.warrantyLabel && <span>{preview.warrantyLabel}</span>}
            </div>
            {preview.description && <p>{preview.description}</p>}
          </aside>
        )}

        {all && (
          <Link href={all.href} className="c-mega-all" onClick={() => setOpen(false)}>
            <span>
              <strong>{all.label}</strong>
              {all.description && <span>{all.description}</span>}
            </span>
            <ArrowRight aria-hidden="true" className="rtl:rotate-180" />
          </Link>
        )}
      </div>
    </li>
  );
}

// ---------------------------------------------------------------- phone and tablet menu

function MobileMenu({
  items,
  labels,
  site,
  whatsappUrl,
  showQuoteButton,
  pathname,
  open,
  setOpen,
}: Omit<HeaderNavProps, 'site'> & {
  site: HeaderNavProps['site'];
  pathname: string;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const isClient = useIsClient();
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [productsOpen, setProductsOpen] = useState(false);
  const wasOpen = useRef(false);

  // While open: no page scroll behind, Escape closes, and focus moves in; on close it returns to the button.
  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      const { overflow } = document.body.style;
      document.body.style.overflow = 'hidden';
      closeRef.current?.focus();
      const onKey = (e: globalThis.KeyboardEvent) => e.key === 'Escape' && setOpen(false);
      document.addEventListener('keydown', onKey);
      // The menu only exists below lg; widening the window closes it.
      const wide = window.matchMedia('(min-width: 64rem)');
      const onWide = () => wide.matches && setOpen(false);
      wide.addEventListener('change', onWide);
      return () => {
        document.body.style.overflow = overflow;
        document.removeEventListener('keydown', onKey);
        wide.removeEventListener('change', onWide);
      };
    }
    if (wasOpen.current) {
      wasOpen.current = false;
      triggerRef.current?.focus();
    }
  }, [open, setOpen]);

  // Keeps Tab inside the open menu.
  const trapFocus = (event: KeyboardEvent) => {
    if (event.key !== 'Tab' || !panelRef.current) return;
    const focusable = panelRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  };

  const close = () => setOpen(false);
  let index = 0;

  const panel = (
    <div
      ref={panelRef}
      id={menuId}
      className="c-menu"
      data-open={open || undefined}
      role="dialog"
      aria-modal="true"
      aria-label={labels.nav}
      inert={!open}
      onKeyDown={trapFocus}
    >
      <div className="c-menu-head">
        <Link href="/" className="c-header-logo" aria-label={`${site.name}, ${labels.home}`} onClick={close}>
          <Image src={site.logo.src} alt={site.name} width={site.logo.width} height={site.logo.height} />
        </Link>
        <button ref={closeRef} type="button" className="c-header-icon-btn" aria-label={labels.close} onClick={close}>
          <X aria-hidden="true" />
        </button>
      </div>

      <nav className="c-menu-body" aria-label={labels.nav}>
        <ul className="c-menu-list">
          {items.map((item) => {
            const style = { '--i': index++ } as CSSProperties;
            if (!item.children?.length) {
              return (
                <li key={item.href} style={style}>
                  <Link
                    href={item.href}
                    className="c-menu-link"
                    aria-current={pathname === item.href ? 'page' : undefined}
                    onClick={close}
                  >
                    {item.label}
                    <ArrowUpRight aria-hidden="true" className="rtl:-scale-x-100" />
                  </Link>
                </li>
              );
            }
            const { groups, all } = productGroups(item);
            return (
              <li key={item.href} style={style}>
                <button
                  type="button"
                  className="c-menu-link"
                  aria-expanded={productsOpen}
                  aria-controls={`${menuId}-products`}
                  onClick={() => setProductsOpen((v) => !v)}
                >
                  {item.label}
                  <ChevronDown aria-hidden="true" className="c-header-chevron" />
                </button>
                <div id={`${menuId}-products`} className="c-menu-products" data-open={productsOpen || undefined}>
                  <div>
                    {groups.map((group) => (
                      <section key={group.key}>
                        <h2>{labels.groups[group.key]}</h2>
                        <ul>
                          {group.links.map((link) => (
                            <li key={link.href}>
                              <Link
                                href={link.href}
                                className="c-menu-series"
                                aria-current={pathname === link.href ? 'page' : undefined}
                                onClick={close}
                              >
                                {link.image ? (
                                  <Image src={link.image} alt="" width={144} height={96} sizes="4.5rem" />
                                ) : (
                                  <span className="c-mega-icon">
                                    <Sparkles aria-hidden="true" />
                                  </span>
                                )}
                                <span>
                                  <strong>{link.label}</strong>
                                  {link.warrantyLabel && <small>{link.warrantyLabel}</small>}
                                </span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </section>
                    ))}
                    {all && (
                      <Link href={all.href} className="c-menu-all" onClick={close}>
                        {all.label}
                        <ArrowRight aria-hidden="true" className="rtl:rotate-180" />
                      </Link>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="c-menu-foot">
        <TrackedLink
          href={`tel:${site.phone.e164}`}
          className="c-menu-action"
          event={{ name: 'call_click', location: 'mobile-menu' }}
        >
          <Phone aria-hidden="true" />
          <span dir="ltr">{site.phone.display}</span>
        </TrackedLink>
        {whatsappUrl && (
          <TrackedLink
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="c-menu-action"
            data-tone="whatsapp"
            event={{ name: 'whatsapp_click', location: 'mobile-menu' }}
          >
            <WhatsAppIcon className="size-5" />
            <span>{labels.whatsapp}</span>
          </TrackedLink>
        )}
        {showQuoteButton && (
          <Link href="/contact" className="c-menu-action" data-tone="primary" onClick={close}>
            <span>{labels.quote}</span>
            <ArrowUpRight aria-hidden="true" className="rtl:-scale-x-100" />
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <div className="c-header-mobile">
      <TrackedLink
        href={`tel:${site.phone.e164}`}
        className="c-header-icon-btn"
        aria-label={`${labels.call} ${site.phone.display}`}
        event={{ name: 'call_click', location: 'header' }}
      >
        <Phone aria-hidden="true" />
      </TrackedLink>
      <button
        ref={triggerRef}
        type="button"
        className="c-header-icon-btn"
        data-tone="solid"
        aria-label={labels.open}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen(true)}
      >
        <Menu aria-hidden="true" />
      </button>
      {/* Rendered into <body>: the header's backdrop blur would otherwise trap a fixed panel inside the bar. */}
      {isClient && createPortal(panel, document.body)}
    </div>
  );
}
