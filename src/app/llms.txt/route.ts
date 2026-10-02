import { siteConfig } from '@/lib/config';
import { getContent, getSite } from '@/lib/content';
import { buildLlmsTxt } from '@/lib/seo/llms';
import { absoluteUrl, localePath } from '@/lib/seo/metadata';

export const dynamic = 'force-static';

export async function GET() {
  const locale = siteConfig.locale.defaultLocale;
  const [site, content] = await Promise.all([getSite(locale), getContent(locale)]);
  const body = buildLlmsTxt({
    site,
    content,
    url: (path) => absoluteUrl(localePath(locale, path)),
    otherLocales: siteConfig.locale.locales
      .filter((l) => l !== locale)
      .map((code) => ({ code, url: absoluteUrl(localePath(code, '/')) })),
  });
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
