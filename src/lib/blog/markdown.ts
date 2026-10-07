/**
 * A small Markdown subset for blog posts written in the admin panel. It is parsed into a tree and
 * rendered as React elements (src/components/blog/markdown.tsx), so post text can never inject HTML.
 *
 * Supported: ## and ### headings, paragraphs, - and 1. lists, > quotes, **bold**, *italic*,
 * `code` and [links](https://…).
 */

export type Inline =
  | { type: 'text'; value: string }
  | { type: 'code'; value: string }
  | { type: 'strong' | 'em'; children: Inline[] }
  | { type: 'link'; href: string; external: boolean; children: Inline[] };

export type Block =
  | { type: 'heading'; level: 2 | 3; id: string; text: string; children: Inline[] }
  | { type: 'paragraph'; children: Inline[] }
  | { type: 'list'; ordered: boolean; items: Inline[][] }
  | { type: 'quote'; children: Inline[] };

const INLINE = /\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\)/g;

/** Links may point at this site, the web, an email address or a phone number. Nothing else. */
const SAFE_HREF = /^(\/(?!\/)|#|https?:\/\/|mailto:|tel:)/i;

export function parseInline(source: string): Inline[] {
  const nodes: Inline[] = [];
  let last = 0;
  for (const match of source.matchAll(INLINE)) {
    if (match.index > last) nodes.push({ type: 'text', value: source.slice(last, match.index) });
    const [whole, strong, em, code, linkText, href] = match;
    if (strong !== undefined) nodes.push({ type: 'strong', children: parseInline(strong) });
    else if (em !== undefined) nodes.push({ type: 'em', children: parseInline(em) });
    else if (code !== undefined) nodes.push({ type: 'code', value: code });
    else if (linkText !== undefined && href !== undefined && SAFE_HREF.test(href)) {
      nodes.push({ type: 'link', href, external: /^https?:/i.test(href), children: parseInline(linkText) });
    } else nodes.push({ type: 'text', value: whole });
    last = match.index + whole.length;
  }
  if (last < source.length) nodes.push({ type: 'text', value: source.slice(last) });
  return nodes;
}

function plainText(nodes: Inline[]): string {
  return nodes.map((node) => ('value' in node ? node.value : plainText(node.children))).join('');
}

/** Anchor id from heading text. Keeps Arabic letters, so Arabic headings get working anchors too. */
function headingId(text: string, used: Map<string, number>): string {
  const base =
    text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, '-')
      .replace(/^-+|-+$/g, '') || 'section';
  const count = used.get(base) ?? 0;
  used.set(base, count + 1);
  return count === 0 ? base : `${base}-${count + 1}`;
}

const HEADING = /^(#{1,3})\s+(.+)$/;
const QUOTE = /^>\s?(.*)$/;
const BULLET = /^[-*]\s+(.+)$/;
const NUMBERED = /^\d+[.)]\s+(.+)$/;

export function parseMarkdown(source: string): Block[] {
  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  const blocks: Block[] = [];
  const usedIds = new Map<string, number>();
  let i = 0;

  /** Collects the consecutive lines matching `pattern`, returning their first capture group. */
  const take = (pattern: RegExp): string[] => {
    const taken: string[] = [];
    for (let match = pattern.exec(lines[i]!.trim()); match; match = pattern.exec(lines[i]?.trim() ?? '')) {
      taken.push(match[1]!);
      i += 1;
      if (i >= lines.length) break;
    }
    return taken;
  };

  while (i < lines.length) {
    const line = lines[i]!.trim();
    if (line === '') {
      i += 1;
      continue;
    }
    const heading = HEADING.exec(line);
    if (heading) {
      const children = parseInline(heading[2]!);
      const text = plainText(children);
      // The page title is the only <h1>, so "#" and "##" both become <h2>.
      blocks.push({
        type: 'heading',
        level: heading[1]!.length === 3 ? 3 : 2,
        id: headingId(text, usedIds),
        text,
        children,
      });
      i += 1;
    } else if (QUOTE.test(line)) {
      blocks.push({ type: 'quote', children: parseInline(take(QUOTE).join(' ').trim()) });
    } else if (BULLET.test(line)) {
      blocks.push({ type: 'list', ordered: false, items: take(BULLET).map(parseInline) });
    } else if (NUMBERED.test(line)) {
      blocks.push({ type: 'list', ordered: true, items: take(NUMBERED).map(parseInline) });
    } else {
      const paragraph: string[] = [];
      while (i < lines.length) {
        const next = lines[i]!.trim();
        if (next === '' || HEADING.test(next) || QUOTE.test(next) || BULLET.test(next) || NUMBERED.test(next)) break;
        paragraph.push(next);
        i += 1;
      }
      blocks.push({ type: 'paragraph', children: parseInline(paragraph.join(' ')) });
    }
  }
  return blocks;
}

/** Whole minutes to read the text at about 200 words a minute, never less than one. */
export function readingMinutes(source: string): number {
  const words = source.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** "PPF vs ceramic coating?" -> "ppf-vs-ceramic-coating". Latin only: slugs are part of the URL. */
export function slugify(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/, '');
}
