import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { deletePost, savePost } from '@/app/actions/admin';
import { AdminForm } from '@/components/admin/admin-form';
import { PostForm } from '@/components/admin/post-form';
import { PageHead, Panel, Pill } from '@/components/admin/ui';
import { ADMIN_ROUTES, POST_STATUS_LABELS } from '@/lib/admin/constants';
import { POST_LIMITS } from '@/lib/admin/posts';
import { requireSession } from '@/lib/auth/session';
import { BLOG_COVERS } from '@/lib/blog/covers';
import { siteConfig } from '@/lib/config';
import { postRepository } from '@/lib/db/repositories/post.repository';

export const metadata: Metadata = { title: 'Edit post' };

export default async function AdminEditPostPage({ params, searchParams }: PageProps<'/admin/blog/[id]'>) {
  await requireSession();
  const [{ id }, { created }] = await Promise.all([params, searchParams]);
  const post = await postRepository.findById(id);
  if (!post) notFound();

  const live = post.status === 'published' && post.publishedAt !== null && post.publishedAt <= new Date();
  const scheduled = post.status === 'published' && !live;
  const locales = siteConfig.locale.locales.filter((locale) => locale in post.translations);

  return (
    <>
      <Link href={ADMIN_ROUTES.blog} className="c-admin-back">
        All posts
      </Link>
      <PageHead title={post.translations.en.title}>
        <Pill tone={scheduled ? 'warning' : live ? 'success' : 'muted'}>
          {scheduled ? 'Scheduled' : POST_STATUS_LABELS[post.status]}
        </Pill>
        {live &&
          locales.map((locale) => (
            <a key={locale} className="c-button" href={`/${locale}/blog/${post.slug}`} target="_blank" rel="noopener">
              View {locale === 'ar' ? 'Arabic' : 'English'}
            </a>
          ))}
      </PageHead>

      {created && (
        <p className="c-admin-notice" role="status">
          Post created. {live ? 'It is live on the site.' : 'Set the status to Published when it is ready.'}
        </p>
      )}

      <PostForm
        action={savePost}
        covers={BLOG_COVERS}
        limits={POST_LIMITS}
        defaultAuthor={`${siteConfig.business.shortName} team`}
        post={post}
      />

      <Panel title="Delete this post" className="c-admin-narrow">
        <p className="c-admin-muted">
          The post is removed from the site and cannot be restored. To hide it instead, set the status to Draft.
        </p>
        <AdminForm action={deletePost} submitLabel="Delete post" quiet>
          <input type="hidden" name="id" value={post.id} />
          <label className="c-admin-check">
            <input type="checkbox" name="confirm" />
            <span>Yes, delete this post permanently</span>
          </label>
        </AdminForm>
      </Panel>
    </>
  );
}
