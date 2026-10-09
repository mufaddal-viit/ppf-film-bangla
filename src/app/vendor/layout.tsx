import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { siteConfig } from '@/lib/config';
import { buildThemeCss, themeAttributes, themeBackground } from '@/lib/theme';
import '../globals.css';

const brand = siteConfig.business.shortName ?? siteConfig.business.name;

/** Root layout for the vendor portal: English only, outside the locale routes, never indexed. */
export const metadata: Metadata = {
  title: { template: `%s · ${brand} vendor portal`, default: `${brand} vendor portal` },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: themeBackground(), width: 'device-width', initialScale: 1 };

export default function VendorRootLayout({ children }: { children: ReactNode }) {
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
