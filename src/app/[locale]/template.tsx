import type { ReactNode } from 'react';

/** Remounts on every navigation, so the page-enter animation (.c-page in globals.css) replays. */
export default function LocaleTemplate({ children }: { children: ReactNode }) {
  return <div className="c-page">{children}</div>;
}
