import { ArrowUpRight } from 'lucide-react';
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
  // Highlights written as "Label: value" are specifications; the rest are feature sentences.
  const specs = service.highlights
    .filter((h) => h.includes(': '))
    .map((h) => {
      const at = h.indexOf(': ');
      const value = h.slice(at + 2);
      // Short values are set as large figures, long ones as full-width table rows.
      return { label: h.slice(0, at), value, wide: value.length > 12 };
    });
  const features = service.highlights.filter((h) => !h.includes(': '));

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

      <div className="c-product-stage">
        <div className="c-container">
          <div className="c-product-visual">
            <Image
              src={service.image.src}
              alt={service.image.alt}
              width={service.image.width}
              height={service.image.height}
              sizes="(min-width: 1280px) 46rem, (min-width: 1024px) 60vw, 100vw"
              fetchPriority="high"
              loading="eager"
              className="c-product-visual-image"
            />
          </div>

          <div className="c-product-summary">
            {facts.length > 0 && (
              <section aria-labelledby="facts-heading" className="c-product-facts">
                <h2 id="facts-heading" className="c-product-kicker">
                  {t('service.facts')}
                </h2>
                <dl className="c-product-stats">
                  {facts.map((fact) => (
                    <div key={fact.label} className="c-product-stat">
                      <dt>{fact.label}</dt>
                      <dd>{fact.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}
            <p className="c-product-lead">{service.shortDescription}</p>
          </div>
        </div>
      </div>

      <div className="c-container c-product-layout">
        <article className="c-product-detail">
          <div className="c-prose c-product-copy" data-reveal>
            {service.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          {service.highlights.length > 0 && (
            <section aria-labelledby="highlights-heading" className="c-product-section">
              <h2 id="highlights-heading" className="c-section-heading c-product-heading" data-reveal>
                {t('service.highlights')}
              </h2>
              {specs.length > 0 && (
                <dl className="c-product-specs">
                  {specs.map((spec) => (
                    <div
                      key={`${spec.label}:${spec.value}`}
                      className="c-product-spec"
                      data-wide={spec.wide ? '' : undefined}
                      data-reveal
                    >
                      <dt>{spec.label}</dt>
                      <dd>{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {features.length > 0 && (
                <ul className="c-product-features">
                  {features.map((feature) => (
                    <li key={feature} data-reveal>
                      {feature}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {faqs.length > 0 && (
            <section aria-labelledby="service-faq-heading" className="c-product-section">
              <h2 id="service-faq-heading" className="c-section-heading c-product-heading" data-reveal>
                {t('service.faq', { service: service.name })}
              </h2>
              <FaqList faqs={faqs} />
            </section>
          )}
        </article>

        <aside className="c-product-aside">
          <div className="c-product-enquiry">
            <LazyLeadForm {...form} defaultService={service.slug} />
          </div>
        </aside>
      </div>

      <nav aria-labelledby="related-heading" className="c-product-related">
        <div className="c-container">
          <h2 id="related-heading" className="c-section-heading c-product-heading" data-reveal>
            {t('service.related')}
          </h2>
          <ul className="c-product-related-list">
            {related.map((s) => (
              <li key={s.slug} data-reveal>
                <Link href={s.href} className="c-product-related-link">
                  <span className="c-product-related-text">
                    <span className="c-product-related-name">{s.name}</span>
                    {s.warrantyYears !== null && (
                      <span className="c-product-related-meta">
                        {t('pricing.warranty', { years: s.warrantyYears })}
                      </span>
                    )}
                  </span>
                  <ArrowUpRight aria-hidden="true" className="c-product-related-arrow" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  );
}
