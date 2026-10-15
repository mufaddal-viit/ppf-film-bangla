'use client';

import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';

/** Matches the phone breakpoint in admin.css, where the sidebar turns into a drawer. */
const PHONE_QUERY = '(max-width: 52rem)';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

type AdminShellProps = {
  /** Names the drawer for screen readers, e.g. "Admin menu". */
  label: string;
  /** Extra items for the phone top bar, after the brand (the account link). */
  barEnd: ReactNode;
  /** The brand link shown in the phone top bar. */
  brand: ReactNode;
  /** The sidebar contents, rendered once and reused as the phone drawer. */
  children: ReactNode;
};

/**
 * The sidebar on desktop; on phones a sticky top bar whose menu button opens the same sidebar as a
 * slide-in drawer. The open state remembers the path it was opened on, so a navigation closes it.
 */
export function AdminShell({ label, brand, barEnd, children }: AdminShellProps) {
  const pathname = usePathname();
  const [openOn, setOpenOn] = useState<string | null>(null);
  const [isPhone, setIsPhone] = useState(false);
  const open = isPhone && openOn === pathname;
  const drawerId = useId();
  const menuButton = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const drawer = useRef<HTMLElement>(null);

  const close = useCallback(() => {
    setOpenOn(null);
    menuButton.current?.focus();
  }, []);

  // Follow the breakpoint, so a drawer left open never sticks around on a wide screen.
  useEffect(() => {
    const query = window.matchMedia(PHONE_QUERY);
    const sync = () => setIsPhone(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  // While open: move focus in, close on Escape and stop the page behind from scrolling.
  useEffect(() => {
    if (!open) return;
    closeButton.current?.focus();
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      root.style.overflow = previous;
    };
  }, [open, close]);

  // Keep Tab inside the drawer while it is open.
  const trapFocus = (event: KeyboardEvent<HTMLElement>) => {
    if (!open || event.key !== 'Tab' || !drawer.current) return;
    const items = [...drawer.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null);
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  };

  // A tap on the link to the page already open would not change the path, so close on any link tap.
  const closeOnLink = (event: MouseEvent<HTMLElement>) => {
    if (open && (event.target as HTMLElement).closest('a')) setOpenOn(null);
  };

  return (
    <>
      <header className="c-admin-bar">
        {brand}
        <div className="c-admin-bar-end">
          {barEnd}
          <button
            ref={menuButton}
            type="button"
            className="c-admin-menu-button"
            aria-expanded={open}
            aria-controls={drawerId}
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => (open ? close() : setOpenOn(pathname))}
          >
            {open ? <X aria-hidden="true" focusable="false" /> : <Menu aria-hidden="true" focusable="false" />}
          </button>
        </div>
      </header>
      <div className="c-admin-scrim" data-open={open} aria-hidden="true" onClick={close} />
      <aside
        ref={drawer}
        id={drawerId}
        className="c-admin-side"
        data-open={open}
        role={isPhone ? 'dialog' : undefined}
        aria-modal={open || undefined}
        aria-label={isPhone ? label : undefined}
        onKeyDown={trapFocus}
        onClick={closeOnLink}
      >
        <button ref={closeButton} type="button" className="c-admin-side-close" aria-label="Close menu" onClick={close}>
          <X aria-hidden="true" focusable="false" />
        </button>
        {children}
      </aside>
    </>
  );
}
