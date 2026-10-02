import type { MetadataRoute } from 'next';
import { featuresConfig, siteConfig } from '@/lib/config';
import { ROUTES, serviceSlugs } from '@/lib/content';
import { getBlogPosts } from '@/lib/content/mdx';
import { absoluteUrl, languageAlternates, localePath } from '@/lib/seo/metadata';

/** Every indexable page in every locale, each with hreflang alternates. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { locales } = siteConfig.locale;
  const paths = [
    ROUTES.home,
    ROUTES.services,
    ...serviceSlugs().map(ROUTES.service),
    ROUTES.gallery,
    ROUTES.prices,
    ROUTES.about,
    ROUTES.contact,
    ...(featuresConfig.blog ? [ROUTES.blog] : []),
    ROUTES.privacyPolicy,
    ROUTES.terms,
  ];

  const entries: MetadataRoute.Sitemap = paths.flatMap((path) =>
    locales.map((locale) => ({
      url: absoluteUrl(localePath(locale, path)),
      alternates: { languages: languageAlternates(path) },
      changeFrequency: path === ROUTES.home ? 'weekly' : 'monthly',
      priority: path === ROUTES.home ? 1 : 0.7,
    })),
  );

  // Blog posts can differ between locales, so only list alternates that exist.
  const postsByLocale = await Promise.all(locales.map(async (l) => [l, await getBlogPosts(l)] as const));
  for (const [locale, posts] of postsByLocale) {
    for (const post of posts) {
      const path = ROUTES.blogPost(post.slug);
      const languages = Object.fromEntries(
        postsByLocale
          .filter(([, other]) => other.some((p) => p.slug === post.slug))
          .map(([l]) => [l, absoluteUrl(localePath(l, path))]),
      );
      entries.push({
        url: absoluteUrl(localePath(locale, path)),
        lastModified: post.updatedAt ?? post.publishedAt,
        alternates: { languages },
        changeFrequency: 'yearly',
        priority: 0.5,
      });
    }
  }
  return entries;
}
