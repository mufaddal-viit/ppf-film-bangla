declare module '*.mdx' {
  import type { MDXContent } from 'mdx/types';

  /** Blog posts export their frontmatter; it is validated by blogFrontmatterSchema. */
  export const frontmatter: unknown;
  const Content: MDXContent;
  export default Content;
}
