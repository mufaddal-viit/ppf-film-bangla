import { describe, expect, it, vi } from 'vitest';
import { parseInline, parseMarkdown, readingMinutes, slugify } from '@/lib/blog/markdown';

// posts.ts and customers.ts wire real infrastructure at import; only their pure helpers are under test here.
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('next/navigation', () => ({ redirect: vi.fn(), unstable_rethrow: vi.fn() }));
vi.mock('@/lib/auth/session', () => ({ requireSession: vi.fn() }));
vi.mock('@/lib/security/request', () => ({ getRequestMeta: vi.fn(), isAllowedOrigin: vi.fn() }));
vi.mock('@/lib/db/repositories/audit.repository', () => ({ auditRepository: {} }));
vi.mock('@/lib/db/repositories/post.repository', () => ({ postRepository: {} }));
vi.mock('@/lib/db/repositories/customer.repository', () => ({ customerRepository: {} }));
vi.mock('@/lib/db/repositories/lead.repository', () => ({ leadRepository: {} }));
vi.mock('@/lib/db/repositories/user.repository', () => ({ isDuplicateKeyError: vi.fn() }));

const { postFormSchema, toPostInput } = await import('@/lib/admin/posts');
const { customersToCsv, parseCustomerFilter, parseTags } = await import('@/lib/admin/customers');

describe('post markdown', () => {
  it('parses headings, paragraphs, lists and quotes', () => {
    const blocks = parseMarkdown(
      'Intro line\ncontinues.\n\n## First\n\n- a\n- b\n\n1. one\n2. two\n\n> quoted\n### Sub',
    );
    expect(blocks.map((b) => b.type)).toEqual(['paragraph', 'heading', 'list', 'list', 'quote', 'heading']);
    expect(blocks[1]).toMatchObject({ level: 2, id: 'first', text: 'First' });
    expect(blocks[2]).toMatchObject({ ordered: false });
    expect(blocks[3]).toMatchObject({ ordered: true });
    expect(blocks[5]).toMatchObject({ level: 3 });
  });

  it('gives repeated and Arabic headings unique, usable ids', () => {
    const blocks = parseMarkdown('## Care\n\n## Care\n\n## العناية بالفيلم');
    expect(blocks.map((b) => (b.type === 'heading' ? b.id : ''))).toEqual(['care', 'care-2', 'العناية-بالفيلم']);
  });

  it('keeps HTML as plain text and drops unsafe link targets', () => {
    expect(parseInline('<script>alert(1)</script>')).toEqual([{ type: 'text', value: '<script>alert(1)</script>' }]);
    expect(parseInline('[x](javascript:alert(1))')[0]).toMatchObject({ type: 'text' });
    expect(parseInline('[x](//evil.example)')[0]).toMatchObject({ type: 'text' });
    expect(parseInline('[quote](/contact)')[0]).toMatchObject({ type: 'link', href: '/contact', external: false });
    expect(parseInline('[site](https://example.com)')[0]).toMatchObject({ type: 'link', external: true });
  });

  it('parses bold, italic and code', () => {
    expect(parseInline('a **b** *c* `d`').map((n) => n.type)).toEqual(['text', 'strong', 'text', 'em', 'text', 'code']);
  });

  it('estimates reading time and builds slugs', () => {
    expect(readingMinutes('word')).toBe(1);
    expect(readingMinutes('word '.repeat(600))).toBe(3);
    expect(slugify('PPF vs Ceramic Coating?')).toBe('ppf-vs-ceramic-coating');
    expect(slugify('مقال')).toBe('');
  });
});

const baseForm = {
  slug: '',
  author: 'Phantom team',
  cover: '',
  tags: 'PPF, ppf , Care',
  status: 'published',
  publishedOn: '',
  title_en: 'How to wash a wrapped car',
  excerpt_en: 'A short routine that keeps film clear.',
  body_en: 'Rinse first, then wash with a soft mitt.',
  seoTitle_en: '',
  seoDescription_en: '',
  title_ar: '',
  excerpt_ar: '',
  body_ar: '',
  seoTitle_ar: '',
  seoDescription_ar: '',
};

describe('post form', () => {
  it('builds the slug, tags and publish date', () => {
    const now = new Date('2026-10-07T08:00:00Z');
    const input = toPostInput(postFormSchema.parse(baseForm), null, now);
    expect(input.slug).toBe('how-to-wash-a-wrapped-car');
    expect(input.tags).toEqual(['ppf', 'care']);
    expect(input.publishedAt).toEqual(now);
    expect(input.translations.ar).toBeUndefined();
    expect(input.cover).toBeUndefined();
  });

  it('keeps the original publish date on edit and leaves drafts undated', () => {
    const first = new Date('2026-09-01T12:00:00Z');
    expect(toPostInput(postFormSchema.parse(baseForm), first).publishedAt).toEqual(first);
    expect(toPostInput(postFormSchema.parse({ ...baseForm, status: 'draft' }), null).publishedAt).toBeUndefined();
    const dated = toPostInput(postFormSchema.parse({ ...baseForm, publishedOn: '2026-12-01' }), first);
    expect(dated.publishedAt?.toISOString()).toBe('2026-12-01T12:00:00.000Z');
  });

  it('rejects a half-filled Arabic translation, an unknown cover and an Arabic-only slug', () => {
    expect(postFormSchema.safeParse({ ...baseForm, title_ar: 'عنوان' }).success).toBe(false);
    expect(postFormSchema.safeParse({ ...baseForm, cover: 'https://evil.example/x.jpg' }).success).toBe(false);
    expect(postFormSchema.safeParse({ ...baseForm, slug: 'مقال' }).success).toBe(false);
    const full = { ...baseForm, title_ar: 'عنوان', excerpt_ar: 'ملخص قصير للمقال', body_ar: 'نص المقال الكامل هنا.' };
    expect(toPostInput(postFormSchema.parse(full), null).translations.ar?.title).toBe('عنوان');
  });
});

describe('customers', () => {
  it('normalises tags', () => {
    expect(parseTags(' PPF, fleet ,ppf,, VIP ')).toEqual(['ppf', 'fleet', 'vip']);
  });

  it('reads list filters and ignores unknown values', () => {
    expect(parseCustomerFilter({ segment: 'due', tag: 'VIP', q: ' sara ' })).toEqual({
      segment: 'due',
      tag: 'vip',
      q: 'sara',
    });
    expect(parseCustomerFilter({ segment: 'all' })).toEqual({});
    expect(parseCustomerFilter({ segment: 'everyone' })).toEqual({});
  });

  it('exports CSV with the phone intact and formulas neutralised', () => {
    const csv = customersToCsv([
      {
        id: '1',
        name: '=HYPERLINK("x")',
        phone: '+971500000001',
        vehicles: [{ id: 'v', make: 'Toyota', model: 'Land Cruiser', year: 2024 }],
        tags: ['ppf', 'vip'],
        marketingOptIn: true,
        notes: [],
        createdAt: new Date('2026-10-01T00:00:00Z'),
        updatedAt: new Date('2026-10-01T00:00:00Z'),
      },
    ]);
    const [, row] = csv.trim().split('\r\n');
    expect(row).toContain(',+971500000001,');
    expect(row).toContain(`"'=HYPERLINK(""x"")"`);
    expect(row).toContain('Toyota Land Cruiser 2024');
    expect(row).toContain('Yes');
  });
});
