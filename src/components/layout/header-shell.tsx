'use client';

import { useEffect, useState, type ReactNode } from 'react';

/** Past this many pixels of scroll the header bar detaches into a floating pill. */
const FLOAT_AFTER = 48;

/**
 * The <header> element. It only tracks whether the page has been scrolled and exposes that as
 * `data-scrolled`; the bar-to-pill morph itself is CSS (src/app/styles/chrome.css).
 */
export function HeaderShell({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > FLOAT_AFTER);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="c-header" data-scrolled={scrolled || undefined}>
      {children}
    </header>
  );
}
