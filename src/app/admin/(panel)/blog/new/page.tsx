import type { Metadata } from 'next';
import Link from 'next/link';
import { savePost } from '@/app/actions/admin';
import { PostForm } from '@/components/admin/post-form';
import { PageHead } from '@/components/admin/ui';
import { ADMIN_ROUTES } from '@/lib/admin/constants';
import { POST_LIMITS } from '@/lib/admin/posts';
import { requireSession } from '@/lib/auth/session';
import { BLOG_COVERS } from '@/lib/blog/covers';
import { siteConfig } from '@/lib/config';

export const metadata: Metadata = { title: 'New post' };

export default async function AdminNewPostPage() {
  await requireSession();
  return (
    <>
      <Link href={ADMIN_ROUTES.blog} className="c-admin-back">
        All posts
      </Link>
      <PageHead title="New post" intro="It is saved as a draft until you set the status to Published." />
      <PostForm
        action={savePost}
        covers={BLOG_COVERS}
        limits={POST_LIMITS}
        defaultAuthor={`${siteConfig.business.shortName} team`}
      />
    </>
  );
}
