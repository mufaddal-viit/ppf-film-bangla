import type { MetadataRoute } from 'next';
import { seoConfig, siteConfig } from '@/lib/config';
import { SITE_URL } from '@/lib/seo/metadata';

/** Crawl rules. AI crawler access is a config setting (config/seo.ts), allowed by default. */
export default function robots(): MetadataRoute.Robots {
  const disallow = ['/api/', ...siteConfig.locale.locales.map((l) => `/${l}/account`)];
  const { policy, userAgents } = seoConfig.aiCrawlers;
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow },
      // A crawler matching a named group ignores the "*" group, so repeat the private paths.
      policy === 'allow' ? { userAgent: userAgents, allow: '/', disallow } : { userAgent: userAgents, disallow: '/' },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
