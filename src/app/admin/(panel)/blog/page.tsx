import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState, PageHead, Pill } from '@/components/admin/ui';
import { ADMIN_ROUTES, POST_STATUS_LABELS } from '@/lib/admin/constants';
import { adminDates } from '@/lib/admin/format';
import { requireSession } from '@/lib/auth/session';
import { siteConfig } from '@/lib/config';
import { postRepository } from '@/lib/db/repositories/post.repository';

export const metadata: Metadata = { title: 'Blog' };

export default async function AdminBlogPage() {
  await requireSession();
  const posts = await postRepository.list();
  const format = adminDates(siteConfig.locale.timezone);
  const now = new Date();
  const live = posts.filter((post) => post.status === 'published' && post.publishedAt && post.publishedAt <= now);

  return (
    <>
      <PageHead
        title="Blog"
        intro={`${posts.length} ${posts.length === 1 ? 'post' : 'posts'}, ${live.length} live on the site`}
      >
        <a className="c-button" href={`/${siteConfig.locale.defaultLocale}/blog`} target="_blank" rel="noopener">
          View blog
        </a>
        <Link className="c-button" data-variant="primary" href={ADMIN_ROUTES.blogNew}>
          New post
        </Link>
      </PageHead>

      {posts.length === 0 ? (
        <EmptyState>No posts yet. Write the first one with “New post”.</EmptyState>
      ) : (
        <div className="c-admin-table">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Languages</th>
                <th>Publish date</th>
                <th>Last edited</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => {
                const scheduled = post.status === 'published' && post.publishedAt && post.publishedAt > now;
                return (
                  <tr key={post.id}>
                    <td>
                      <Link href={`${ADMIN_ROUTES.blog}/${post.id}`}>{post.translations.en.title}</Link>
                      <small>/blog/{post.slug}</small>
                    </td>
                    <td>
                      <Pill tone={scheduled ? 'warning' : post.status === 'published' ? 'success' : 'muted'}>
                        {scheduled ? 'Scheduled' : POST_STATUS_LABELS[post.status]}
                      </Pill>
                    </td>
                    <td>{post.translations.ar ? 'English, Arabic' : 'English'}</td>
                    <td>{post.publishedAt ? format.day(post.publishedAt) : '–'}</td>
                    <td>{format.dateTime(post.updatedAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
