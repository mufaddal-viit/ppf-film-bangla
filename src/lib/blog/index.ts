import 'server-only';
import { cache } from 'react';
import { featuresConfig, siteConfig } from '@/lib/config';
import { postRepository, type Post } from '@/lib/db/repositories/post.repository';
import { logger } from '@/lib/logger';
import { readingMinutes } from './markdown';

/** A published post in one language, as the public pages use it. */
export type PostView = {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  seoTitle: string;
  seoDescription: string;
  author: string;
  cover: string | null;
  tags: string[];
  /** YYYY-MM-DD */
  publishedAt: string;
  updatedAt: string;
  readingMinutes: number;
  /** Languages this post exists in, for hreflang links. */
  locales: string[];
};

function toView(post: Post, locale: string): PostView | null {
  const translation = post.translations[locale as keyof Post['translations']];
  if (!translation || !post.publishedAt) return null;
  return {
    slug: post.slug,
    title: translation.title,
    excerpt: translation.excerpt,
    body: translation.body,
    seoTitle: translation.seoTitle || translation.title,
    seoDescription: translation.seoDescription || translation.excerpt,
    author: post.author,
    cover: post.cover ?? null,
    tags: post.tags,
    publishedAt: post.publishedAt.toISOString().slice(0, 10),
    updatedAt: post.updatedAt.toISOString().slice(0, 10),
    readingMinutes: readingMinutes(translation.body),
    locales: siteConfig.locale.locales.filter((l) => l in post.translations),
  };
}

/**
 * Published posts in a language, newest first. Pages using this are cached and refreshed when a
 * post is saved (src/lib/admin/posts.ts). During `next build` a missing database yields an empty
 * list instead of failing the build; the first request after deploy fills the page.
 */
export const getPublishedPosts = cache(async (locale: string): Promise<PostView[]> => {
  if (!featuresConfig.blog) return [];
  try {
    const posts = await postRepository.listPublished(locale);
    return posts.flatMap((post) => toView(post, locale) ?? []);
  } catch (error) {
    if (process.env.NEXT_PHASE !== 'phase-production-build') throw error;
    logger.warn('blog.unavailable_at_build', { locale });
    return [];
  }
});

export async function getPublishedPost(locale: string, slug: string): Promise<PostView | null> {
  return (await getPublishedPosts(locale)).find((post) => post.slug === slug) ?? null;
}
