import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHeader } from '@/components/layout/page-header';
import { routing } from '@/i18n/routing';
import { getPageCopy, getSite, ROUTES } from '@/lib/content';
import { formatDate } from '@/lib/content/format';
import { getBlogPost, getBlogPosts } from '@/lib/content/mdx';
import { buildBreadcrumbs, buildMetadata } from '@/lib/seo/metadata';

export const dynamicParams = false;

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  const locale = params.locale ?? routing.defaultLocale;
  return (await getBlogPosts(locale)).map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps<'/[locale]/blog/[slug]'>): Promise<Metadata> {
  const { locale, slug } = await params;
  const result = await getBlogPost(locale, slug);
  if (!result) notFound();
  return buildMetadata({
    locale,
    path: ROUTES.blogPost(slug),
    title: result.post.title,
    description: result.post.description,
    type: 'article',
  });
}

export default async function BlogPostPage({ params }: PageProps<'/[locale]/blog/[slug]'>) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const [result, blogCopy, site, t] = await Promise.all([
    getBlogPost(locale, slug),
    getPageCopy('blog', locale),
    getSite(locale),
    getTranslations({ locale }),
  ]);
  if (!result) notFound();
  const { post, Content } = result;

  return (
    <article>
      <PageHeader
        title={post.title}
        intro={post.description}
        breadcrumbLabel={t('a11y.breadcrumb')}
        breadcrumbs={buildBreadcrumbs(locale, t('nav.home'), [
          { name: blogCopy.title, path: ROUTES.blog },
          { name: post.title, path: ROUTES.blogPost(slug) },
        ])}
      />
      <div className="c-container">
        <p className="mb-6 text-sm text-muted-foreground">
          {t('blog.by', { author: post.author })} ·{' '}
          <time dateTime={post.publishedAt}>
            {t('blog.publishedOn', { date: formatDate(post.publishedAt, locale, site.region) })}
          </time>
        </p>
        <div className="c-prose">
          <Content />
        </div>
      </div>
    </article>
  );
}
