import type { MDXComponents } from 'mdx/types';

/** Required by @next/mdx. Element styling lives on the .c-prose wrapper in globals.css. */
const components: MDXComponents = {};

export function useMDXComponents(): MDXComponents {
  return components;
}
