import 'server-only';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { BLOG_COVER_PATHS } from '@/lib/blog/covers';
import { slugify } from '@/lib/blog/markdown';
import type { PostTranslation } from '@/lib/db/collections';
import { auditRepository } from '@/lib/db/repositories/audit.repository';
import { postRepository, type PostInput } from '@/lib/db/repositories/post.repository';
import { isDuplicateKeyError } from '@/lib/db/repositories/user.repository';
import { ActionError, adminAction } from './action';
import { ADMIN_ROUTES, POST_STATUSES } from './constants';

const idSchema = z.string().regex(/^[0-9a-f]{24}$/);
const NOT_FOUND = 'That post no longer exists.';

/** Limits follow what search results show: about 60 characters of title, 160 of description. */
export const POST_LIMITS = { title: 90, excerpt: 220, body: 40_000, seoTitle: 70, seoDescription: 170 } as const;

const optional = (max: number) => z.string().trim().max(max, `Keep this under ${max} characters.`);

export const postFormSchema = z
  .object({
    id: z.union([z.literal(''), idSchema]).optional(),
    slug: optional(80),
    author: z.string().trim().min(2, 'Enter the author name.').max(80),
    cover: z.string().refine((value) => value === '' || BLOG_COVER_PATHS.includes(value), 'Choose a listed image.'),
    tags: optional(200),
    status: z.enum(POST_STATUSES),
    // <input type="date">; empty means "now" when publishing.
    publishedOn: z.union([z.literal(''), z.iso.date('Choose a valid date.')]),
    title_en: z.string().trim().min(3, 'Enter an English title.').max(POST_LIMITS.title),
    excerpt_en: z.string().trim().min(10, 'Write a short English summary.').max(POST_LIMITS.excerpt),
    body_en: z.string().trim().min(20, 'Write the English article.').max(POST_LIMITS.body),
    seoTitle_en: optional(POST_LIMITS.seoTitle),
    seoDescription_en: optional(POST_LIMITS.seoDescription),
    title_ar: optional(POST_LIMITS.title),
    excerpt_ar: optional(POST_LIMITS.excerpt),
    body_ar: optional(POST_LIMITS.body),
    seoTitle_ar: optional(POST_LIMITS.seoTitle),
    seoDescription_ar: optional(POST_LIMITS.seoDescription),
  })
  .superRefine((data, ctx) => {
    // Arabic is optional, but a half-filled translation would publish a broken page.
    const arabic = [data.title_ar, data.excerpt_ar, data.body_ar];
    if (arabic.some(Boolean) && !arabic.every(Boolean)) {
      ctx.addIssue({
        code: 'custom',
        path: ['title_ar'],
        message: 'Arabic needs a title, a summary and the article, or leave all three empty.',
      });
    }
    const slug = data.slug ? slugify(data.slug) : slugify(data.title_en);
    if (!slug) {
      ctx.addIssue({ code: 'custom', path: ['slug'], message: 'Enter a web address using English letters.' });
    }
  });

type PostForm = z.output<typeof postFormSchema>;

function translation(title: string, excerpt: string, body: string, seoTitle: string, seoDescription: string) {
  return { title, excerpt, body, ...(seoTitle && { seoTitle }), ...(seoDescription && { seoDescription }) };
}

/** Form values -> stored post. `previousPublishedAt` keeps the original date when a post is edited. */
export function toPostInput(data: PostForm, previousPublishedAt: Date | null, now = new Date()): PostInput {
  const tags = [
    ...new Set(
      data.tags
        .split(',')
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean),
    ),
  ].slice(0, 8);
  const ar: PostTranslation | undefined = data.title_ar
    ? translation(data.title_ar, data.excerpt_ar, data.body_ar, data.seoTitle_ar, data.seoDescription_ar)
    : undefined;
  // Midday UTC, so the date reads the same across Gulf and European timezones.
  const chosen = data.publishedOn ? new Date(`${data.publishedOn}T12:00:00.000Z`) : null;
  const publishedAt = data.status === 'published' ? (chosen ?? previousPublishedAt ?? now) : chosen;

  return {
    slug: data.slug ? slugify(data.slug) : slugify(data.title_en),
    status: data.status,
    author: data.author,
    tags,
    translations: {
      en: translation(data.title_en, data.excerpt_en, data.body_en, data.seoTitle_en, data.seoDescription_en),
      ...(ar && { ar }),
    },
    ...(publishedAt && { publishedAt }),
    ...(data.cover && { cover: data.cover }),
  };
}

/** Public pages are cached; saving a post refreshes the blog in every language and the sitemap. */
function refresh() {
  revalidatePath('/[locale]/blog', 'page');
  revalidatePath('/[locale]/blog/[slug]', 'page');
  revalidatePath('/sitemap.xml');
  revalidatePath(ADMIN_ROUTES.blog);
  revalidatePath(ADMIN_ROUTES.dashboard);
}

export const savePost = adminAction({
  name: 'post.save',
  schema: postFormSchema,
  async handler(data, session) {
    const existing = data.id ? await postRepository.findById(data.id) : null;
    if (data.id && !existing) throw new ActionError(NOT_FOUND);
    const input = toPostInput(data, existing?.publishedAt ?? null);

    let createdId: string | undefined;
    try {
      if (existing) await postRepository.update(existing.id, input);
      else createdId = (await postRepository.create(input)).id;
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new ActionError(`Another post already uses the address "${input.slug}". Change the web address.`);
      }
      throw error;
    }
    await auditRepository.record(session, existing ? 'post.updated' : 'post.created', input.slug, input.status);
    refresh();
    if (createdId) redirect(`${ADMIN_ROUTES.blog}/${createdId}?created=1`);

    if (input.status === 'draft') return 'Draft saved. Visitors cannot see it yet.';
    return input.publishedAt && input.publishedAt > new Date()
      ? 'Saved. It goes live on the publish date.'
      : 'Saved and live on the site.';
  },
});

export const deletePost = adminAction({
  name: 'post.delete',
  schema: z.object({ id: idSchema, confirm: z.literal('on', 'Tick the box to confirm.') }),
  async handler({ id }, session) {
    const post = await postRepository.findById(id);
    if (!post || !(await postRepository.delete(id))) throw new ActionError(NOT_FOUND);
    await auditRepository.record(session, 'post.deleted', post.slug);
    refresh();
    redirect(ADMIN_ROUTES.blog);
  },
});
