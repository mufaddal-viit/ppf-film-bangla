import 'server-only';
import type { MDXContent } from 'mdx/types';

/**
 * Legal pages are MDX files in content/{locale}/legal. They are compiled at build time from the
 * repository, so they are trusted content. Blog posts live in the database (src/lib/blog).
 */
type MdxModule = { default: MDXContent };

export type LegalDocument = 'privacy-policy' | 'terms';

export async function getLegalDocument(locale: string, doc: LegalDocument): Promise<MDXContent> {
  const mod: MdxModule = await import(`../../../content/${locale}/legal/${doc}.mdx`);
  return mod.default;
}
