import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { LazyLeadForm } from '@/components/forms/lazy-lead-form';
import { PageHeader } from '@/components/layout/page-header';
import { FaqList } from '@/components/sections/faq';
import { JsonLd } from '@/components/seo/json-ld';
import { Link } from '@/i18n/navigation';
import { getContent, getLeadFormProps, getPageCopy, getSite, ROUTES, serviceSlugs } from '@/lib/content';
import { serviceJsonLd } from '@/lib/seo/jsonld';
import { absoluteUrl, buildBreadcrumbs, buildMetadata, localePath, SITE_URL } from '@/lib/seo/metadata';

export const dynamicParams = false;

export function generateStaticParams() {
  return serviceSlugs().map((slug) => ({ slug }));
}

async function getService(locale: string, slug: string) {
  const service = (await getContent(locale)).services.find((s) => s.slug === slug);
  if (!service) notFound();
  return service;
}

export async function generateMetadata({ params }: PageProps<'/[locale]/services/[slug]'>): Promise<Metadata> {
  const { locale, slug } = await params;
  const service = await getService(locale, slug);
  return buildMetadata({
    locale,
    path: service.href,
    title: service.seo.title,
    description: service.seo.description,
    image: service.image,
  });
}

/** Service detail: direct answer first (AEO), then key facts from config, detail, FAQs and a quote form. */
export default async function ServicePage({ params }: PageProps<'/[locale]/services/[slug]'>) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const [service, content, site, servicesCopy, form, t] = await Promise.all([
    getService(locale, slug),
    getContent(locale),
    getSite(locale),
    getPageCopy('services', locale),
    getLeadFormProps('quote', locale),
    getTranslations({ locale }),
  ]);
  const faqs = content.faqs.filter((f) => f.serviceSlug === slug);
  const related = content.services.filter((s) => s.slug !== slug);
  const facts = [
    { label: t('service.priceFrom'), value: service.priceFromLabel },
    { label: t('service.warranty'), value: service.warrantyLabel },
    { label: t('service.turnaround'), value: service.turnaroundLabel },
  ].filter((f): f is { label: string; value: string } => f.value !== null);

  return (
    <>
      <PageHeader
        title={service.name}
        intro={service.answer}
        breadcrumbLabel={t('a11y.breadcrumb')}
        breadcrumbs={buildBreadcrumbs(locale, t('nav.home'), [
          { name: servicesCopy.title, path: ROUTES.services },
          { name: service.name, path: service.href },
        ])}
      />
      <JsonLd
        data={serviceJsonLd(service, site, {
          siteUrl: SITE_URL,
          pageUrl: absoluteUrl(localePath(locale, service.href)),
        })}
      />

      <div className="c-container grid gap-10 lg:grid-cols-[2fr_1fr]">
        <article className="c-service-detail space-y-8">
          <Image
            src={service.image.src}
            alt={service.image.alt}
            width={service.image.width}
            height={service.image.height}
            sizes="(min-width: 1024px) 66vw, 100vw"
            fetchPriority="high"
            loading="eager"
            className="h-auto w-full rounded-lg"
          />

          {facts.length > 0 && (
            <section aria-labelledby="facts-heading">
              <h2 id="facts-heading" className="c-section-heading">
                {t('service.facts')}
              </h2>
              <dl className="grid gap-4 sm:grid-cols-3">
                {facts.map((fact) => (
                  <div key={fact.label} className="c-card">
                    <dt className="text-sm text-muted-foreground">{fact.label}</dt>
                    <dd className="text-lg font-semibold">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          <div className="c-prose">
            {service.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          {service.highlights.length > 0 && (
            <section aria-labelledby="highlights-heading">
              <h2 id="highlights-heading" className="c-section-heading">
                {t('service.highlights')}
              </h2>
              <ul className="list-disc space-y-1 ps-6">
                {service.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </section>
          )}

          {faqs.length > 0 && (
            <section aria-labelledby="service-faq-heading">
              <h2 id="service-faq-heading" className="c-section-heading">
                {t('service.faq', { service: service.name })}
              </h2>
              <FaqList faqs={faqs} />
            </section>
          )}
        </article>

        <aside className="space-y-8">
          <div className="c-card">
            <LazyLeadForm {...form} defaultService={service.slug} />
          </div>
          <nav aria-labelledby="related-heading">
            <h2 id="related-heading" className="mb-3 font-semibold">
              {t('service.related')}
            </h2>
            <ul className="space-y-2">
              {related.map((s) => (
                <li key={s.slug}>
                  <Link href={s.href}>{s.name}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      </div>
    </>
  );
}
