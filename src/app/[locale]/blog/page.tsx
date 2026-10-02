import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHeader } from '@/components/layout/page-header';
import { Link } from '@/i18n/navigation';
import { featuresConfig } from '@/lib/config';
import { getPageCopy, getSite, ROUTES } from '@/lib/content';
import { formatDate } from '@/lib/content/format';
import { getBlogPosts } from '@/lib/content/mdx';
import { buildBreadcrumbs, buildMetadata } from '@/lib/seo/metadata';

export async function generateMetadata({ params }: PageProps<'/[locale]/blog'>): Promise<Metadata> {
  const { locale } = await params;
  const copy = await getPageCopy('blog', locale);
  return buildMetadata({ locale, path: ROUTES.blog, title: copy.seo.title, description: copy.seo.description });
}

export default async function BlogIndexPage({ params }: PageProps<'/[locale]/blog'>) {
  const { locale } = await params;
  if (!featuresConfig.blog) notFound();
  setRequestLocale(locale);
  const [copy, posts, site, t] = await Promise.all([
    getPageCopy('blog', locale),
    getBlogPosts(locale),
    getSite(locale),
    getTranslations({ locale }),
  ]);

  return (
    <>
      <PageHeader
        title={copy.title}
        intro={copy.intro}
        breadcrumbLabel={t('a11y.breadcrumb')}
        breadcrumbs={buildBreadcrumbs(locale, t('nav.home'), [{ name: copy.title, path: ROUTES.blog }])}
      />
      <div className="c-container">
        {posts.length === 0 ? (
          <p>{t('blog.empty')}</p>
        ) : (
          <ul className="c-grid">
            {posts.map((post) => (
              <li key={post.slug}>
                <article className="c-card c-post-card flex h-full flex-col gap-2">
                  <h2 className="text-lg font-semibold">
                    <Link href={ROUTES.blogPost(post.slug)}>{post.title}</Link>
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    <time dateTime={post.publishedAt}>{formatDate(post.publishedAt, locale, site.region)}</time>
                  </p>
                  <p>{post.description}</p>
                </article>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
