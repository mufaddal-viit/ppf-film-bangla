import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHeader } from '@/components/layout/page-header';
import { Link } from '@/i18n/navigation';
import { getPublishedPosts, type PostView } from '@/lib/blog';
import { featuresConfig } from '@/lib/config';
import { getPageCopy, getSite, ROUTES } from '@/lib/content';
import { formatDate } from '@/lib/content/format';
import { buildBreadcrumbs, buildMetadata } from '@/lib/seo/metadata';

/** Cached for an hour so scheduled posts appear; saving a post in the admin panel refreshes it at once. */
export const revalidate = 3600;

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
    getPublishedPosts(locale),
    getSite(locale),
    getTranslations({ locale }),
  ]);
  const [featured, ...rest] = posts;
  const meta = (post: PostView) => (
    <p className="c-blog-meta">
      <time dateTime={post.publishedAt}>{formatDate(post.publishedAt, locale, site.region)}</time>
      <span>{t('blog.readingTime', { minutes: post.readingMinutes })}</span>
    </p>
  );

  return (
    <>
      <PageHeader
        title={copy.title}
        intro={copy.intro}
        breadcrumbLabel={t('a11y.breadcrumb')}
        breadcrumbs={buildBreadcrumbs(locale, t('nav.home'), [{ name: copy.title, path: ROUTES.blog }])}
      />
      <div className="c-container c-blog">
        {!featured ? (
          <p className="c-blog-empty">{t('blog.empty')}</p>
        ) : (
          <>
            <article className="c-blog-featured">
              {featured.cover && (
                <div className="c-blog-featured-media">
                  <Image src={featured.cover} alt="" fill priority sizes="(min-width: 64rem) 55vw, 100vw" />
                </div>
              )}
              <div className="c-blog-featured-body">
                <p className="c-blog-kicker">{t('blog.latest')}</p>
                <h2>
                  <Link href={ROUTES.blogPost(featured.slug)} className="c-card-link">
                    {featured.title}
                  </Link>
                </h2>
                <p className="c-blog-excerpt">{featured.excerpt}</p>
                {meta(featured)}
              </div>
            </article>

            {rest.length > 0 && (
              <ol className="c-blog-list">
                {rest.map((post, index) => (
                  <li key={post.slug}>
                    <article className="c-blog-row">
                      <span className="c-blog-number" aria-hidden="true">
                        {String(index + 2).padStart(2, '0')}
                      </span>
                      <div className="c-blog-row-body">
                        {meta(post)}
                        <h2>
                          <Link href={ROUTES.blogPost(post.slug)} className="c-card-link">
                            {post.title}
                          </Link>
                        </h2>
                        <p className="c-blog-excerpt">{post.excerpt}</p>
                      </div>
                      {post.cover && (
                        <div className="c-blog-row-media">
                          <Image src={post.cover} alt="" fill sizes="(min-width: 48rem) 16rem, 100vw" />
                        </div>
                      )}
                    </article>
                  </li>
                ))}
              </ol>
            )}
          </>
        )}
      </div>
    </>
  );
}
