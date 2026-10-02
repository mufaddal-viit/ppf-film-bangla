import type { ReactNode } from 'react';

/** The real root layout is app/[locale]/layout.tsx, which renders <html> with lang and dir. */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
