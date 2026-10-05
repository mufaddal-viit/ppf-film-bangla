import 'server-only';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import type { MDXContent } from 'mdx/types';
import { cache } from 'react';
import { featuresConfig, parseOrThrow } from '@/lib/config';
import { blogFrontmatterSchema, type BlogFrontmatter } from './schema';

/**
 * Blog posts and legal pages are MDX files in content/{locale}/. They are compiled at
 * build time from the repository, so they are trusted content (no runtime HTML).
 */
type MdxModule = { default: MDXContent; frontmatter?: unknown };

type BlogPost = BlogFrontmatter & { slug: string };

async function importPost(locale: string, slug: string): Promise<MdxModule> {
  return import(`../../../content/${locale}/blog/${slug}.mdx`);
}

export const getBlogPosts = cache(async (locale: string): Promise<BlogPost[]> => {
  if (!featuresConfig.blog) return [];
  const dir = path.join(process.cwd(), 'content', locale, 'blog');
  const files = (await readdir(dir).catch(() => [])).filter((f) => f.endsWith('.mdx'));
  const posts = await Promise.all(
    files.map(async (file) => {
      const slug = file.replace(/\.mdx$/, '');
      const mod = await importPost(locale, slug);
      const frontmatter = parseOrThrow(blogFrontmatterSchema, mod.frontmatter, `content/${locale}/blog/${file}`);
      return { ...frontmatter, slug };
    }),
  );
  return posts
    .filter((p) => !p.draft || process.env.NODE_ENV === 'development')
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
});

export async function getBlogPost(locale: string, slug: string) {
  const post = (await getBlogPosts(locale)).find((p) => p.slug === slug);
  if (!post) return null;
  const { default: Content } = await importPost(locale, slug);
  return { post, Content };
}

export type LegalDocument = 'privacy-policy' | 'terms';

export async function getLegalDocument(locale: string, doc: LegalDocument): Promise<MDXContent> {
  const mod: MdxModule = await import(`../../../content/${locale}/legal/${doc}.mdx`);
  return mod.default;
}
