import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Markdown } from '@/components/blog/markdown';
import { PageHeader } from '@/components/layout/page-header';
import { JsonLd } from '@/components/seo/json-ld';
import { Link } from '@/i18n/navigation';
import { getPublishedPost, getPublishedPosts } from '@/lib/blog';
import { parseMarkdown } from '@/lib/blog/markdown';
import { featuresConfig } from '@/lib/config';
import { getPageCopy, getSite, ROUTES } from '@/lib/content';
import { formatDate } from '@/lib/content/format';
import { articleJsonLd } from '@/lib/seo/jsonld';
import { absoluteUrl, buildBreadcrumbs, buildMetadata, localePath, SITE_URL } from '@/lib/seo/metadata';

/** Posts are rendered on first visit and cached; saving a post in the admin panel refreshes them. */
export const revalidate = 3600;

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps<'/[locale]/blog/[slug]'>): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPublishedPost(locale, slug);
  if (!post) notFound();
  return buildMetadata({
    locale,
    path: ROUTES.blogPost(slug),
    title: post.seoTitle,
    description: post.seoDescription,
    type: 'article',
    locales: post.locales,
  });
}

export default async function BlogPostPage({ params }: PageProps<'/[locale]/blog/[slug]'>) {
  const { locale, slug } = await params;
  if (!featuresConfig.blog) notFound();
  setRequestLocale(locale);
  const [post, posts, blogCopy, site, t] = await Promise.all([
    getPublishedPost(locale, slug),
    getPublishedPosts(locale),
    getPageCopy('blog', locale),
    getSite(locale),
    getTranslations({ locale }),
  ]);
  if (!post) notFound();

  const blocks = parseMarkdown(post.body);
  const headings = blocks.flatMap((block) => (block.type === 'heading' && block.level === 2 ? block : []));
  const more = posts.filter((other) => other.slug !== post.slug).slice(0, 3);

  return (
    <article>
      <PageHeader
        title={post.title}
        intro={post.excerpt}
        breadcrumbLabel={t('a11y.breadcrumb')}
        breadcrumbs={buildBreadcrumbs(locale, t('nav.home'), [
          { name: blogCopy.title, path: ROUTES.blog },
          { name: post.title, path: ROUTES.blogPost(slug) },
        ])}
      />
      <div className="c-container c-post">
        <p className="c-blog-meta">
          <span>{t('blog.by', { author: post.author })}</span>
          <time dateTime={post.publishedAt}>
            {t('blog.publishedOn', { date: formatDate(post.publishedAt, locale, site.region) })}
          </time>
          <span>{t('blog.readingTime', { minutes: post.readingMinutes })}</span>
        </p>

        {post.cover && (
          <div className="c-post-cover">
            <Image src={post.cover} alt="" fill priority sizes="(min-width: 80rem) 76rem, 100vw" />
          </div>
        )}

        <div className="c-post-layout" data-toc={headings.length > 1 || undefined}>
          {headings.length > 1 && (
            <nav className="c-post-toc" aria-label={t('blog.onThisPage')}>
              <p>{t('blog.onThisPage')}</p>
              <ol>
                {headings.map((heading) => (
                  <li key={heading.id}>
                    <a href={`#${heading.id}`}>{heading.text}</a>
                  </li>
                ))}
              </ol>
            </nav>
          )}
          <div className="c-prose c-post-body">
            <Markdown blocks={blocks} />
            {post.tags.length > 0 && (
              <ul className="c-post-tags">
                {post.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <aside className="c-post-cta">
          <div>
            <h2>{t('blog.ctaTitle')}</h2>
            <p>{t('blog.ctaText')}</p>
          </div>
          <Link href={ROUTES.contact} className="c-button" data-variant="primary">
            {t('contact.getQuote')}
          </Link>
        </aside>

        {more.length > 0 && (
          <section className="c-post-more" aria-labelledby="more-articles">
            <h2 id="more-articles">{t('blog.moreArticles')}</h2>
            <ul>
              {more.map((other) => (
                <li key={other.slug}>
                  <p className="c-blog-meta">
                    <time dateTime={other.publishedAt}>{formatDate(other.publishedAt, locale, site.region)}</time>
                  </p>
                  <h3>
                    <Link href={ROUTES.blogPost(other.slug)} className="c-card-link">
                      {other.title}
                    </Link>
                  </h3>
                  <p>{other.excerpt}</p>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
      <JsonLd
        data={articleJsonLd(post, {
          siteUrl: SITE_URL,
          pageUrl: absoluteUrl(localePath(locale, ROUTES.blogPost(slug))),
          image: absoluteUrl(post.cover ?? site.logo.src),
          locale,
          publisher: site.name,
        })}
      />
    </article>
  );
}
