import 'server-only';
import type { Metadata } from 'next';
import { seoConfig, siteConfig } from '@/lib/config';
import { publicEnv } from '@/lib/env.public';

export const SITE_URL = publicEnv.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');

/** Locale-prefixed path: localePath('ar', '/services') -> '/ar/services'. */
export function localePath(locale: string, path: string): string {
  return path === '/' ? `/${locale}` : `/${locale}${path}`;
}

export function absoluteUrl(path: string): string {
  return new URL(path, `${SITE_URL}/`).toString();
}

/** hreflang map for a path, including x-default. */
export function languageAlternates(path: string): Record<string, string> {
  const alternates: Record<string, string> = {};
  for (const locale of siteConfig.locale.locales) alternates[locale] = absoluteUrl(localePath(locale, path));
  alternates['x-default'] = absoluteUrl(localePath(siteConfig.locale.defaultLocale, path));
  return alternates;
}

/** Breadcrumb trail starting at the home page, with absolute URLs for JSON-LD. */
export function buildBreadcrumbs(locale: string, homeLabel: string, trail: Array<{ name: string; path: string }>) {
  return [{ name: homeLabel, path: '/' }, ...trail].map((crumb) => ({
    name: crumb.name,
    href: crumb.path,
    url: absoluteUrl(localePath(locale, crumb.path)),
  }));
}

const OG_LOCALES: Record<string, string> = Object.fromEntries(
  siteConfig.locale.locales.map((l) => [l, `${l}_${siteConfig.locale.phoneRegion}`]),
);

/** Per-page metadata: title, description, canonical, hreflang, Open Graph and Twitter. */
export function buildMetadata({
  locale,
  path,
  title,
  description,
  image = seoConfig.defaultOgImage,
  noindex = false,
  type = 'website',
}: {
  locale: string;
  /** Path without locale prefix, e.g. "/services/ceramic-coating" or "/". */
  path: string;
  title: string;
  description: string;
  image?: { src: string; width: number; height: number };
  noindex?: boolean;
  type?: 'website' | 'article';
}): Metadata {
  const url = absoluteUrl(localePath(locale, path));
  const ogImage = { url: absoluteUrl(image.src), width: image.width, height: image.height };
  return {
    title,
    description,
    alternates: { canonical: url, languages: languageAlternates(path) },
    openGraph: {
      type,
      url,
      title,
      description,
      siteName: siteConfig.business.name,
      locale: OG_LOCALES[locale] ?? locale,
      alternateLocale: siteConfig.locale.locales.filter((l) => l !== locale).map((l) => OG_LOCALES[l] ?? l),
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage.url],
      ...(seoConfig.twitterHandle && { site: seoConfig.twitterHandle }),
    },
    ...(noindex && { robots: { index: false, follow: false } }),
  };
}
