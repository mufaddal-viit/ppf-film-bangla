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
export function languageAlternates(
  path: string,
  /** Languages the page exists in. Defaults to all of them. */
  locales: readonly string[] = siteConfig.locale.locales,
): Record<string, string> {
  const alternates: Record<string, string> = {};
  for (const locale of locales) alternates[locale] = absoluteUrl(localePath(locale, path));
  const fallback = locales.includes(siteConfig.locale.defaultLocale) ? siteConfig.locale.defaultLocale : locales[0];
  if (fallback) alternates['x-default'] = absoluteUrl(localePath(fallback, path));
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
  locales,
}: {
  locale: string;
  /** Path without locale prefix, e.g. "/services/ceramic-coating" or "/". */
  path: string;
  title: string;
  description: string;
  image?: { src: string; width: number; height: number };
  noindex?: boolean;
  type?: 'website' | 'article';
  /** Languages the page exists in, when it is not translated into all of them. */
  locales?: readonly string[];
}): Metadata {
  const url = absoluteUrl(localePath(locale, path));
  const ogImage = { url: absoluteUrl(image.src), width: image.width, height: image.height };
  return {
    title,
    description,
    alternates: { canonical: url, languages: languageAlternates(path, locales) },
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
