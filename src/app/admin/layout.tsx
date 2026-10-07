import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { siteConfig } from '@/lib/config';
import { buildThemeCss, themeAttributes, themeBackground } from '@/lib/theme';
import '../globals.css';

/** Root layout for the admin panel: English only, outside the locale routes, never indexed. */
export const metadata: Metadata = {
  title: { template: `%s · ${siteConfig.business.shortName} admin`, default: `${siteConfig.business.shortName} admin` },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: themeBackground(), width: 'device-width', initialScale: 1 };

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr" data-scroll-behavior="smooth" {...themeAttributes()}>
      <head>
        {/* Generated from config/theme.ts, same tokens as the public site. */}
        <style href="theme-tokens" precedence="high">
          {buildThemeCss()}
        </style>
      </head>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
