import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Section } from '@/components/ui/section';
import { Link } from '@/i18n/navigation';
import type { SectionProps } from './types';

/** The product index: one full-width row per film line, numbered by CSS (see products.css). */
export async function ServicesGrid({ section, data }: SectionProps<'servicesGrid'>) {
  const t = await getTranslations({ locale: data.locale });
  const services =
    section.serviceSlugs.length === 0
      ? data.content.services
      : data.content.services.filter((s) => section.serviceSlugs.includes(s.slug));

  return (
    <Section
      id={section.id}
      name="servicesGrid"
      heading={section.heading}
      intro={section.intro}
      className="c-services-grid"
    >
      <ol className="c-product-index">
        {services.map((service) => {
          const meta = service.priceFromLabel
            ? { label: t('service.priceFrom'), value: service.priceFromLabel }
            : service.warrantyLabel
              ? { label: t('service.warranty'), value: service.warrantyLabel }
              : { label: null, value: t('pricing.onRequest') };

          return (
            <li key={service.slug} className="c-product-row" data-reveal>
              <div className="c-product-body">
                <h3 className="c-product-name">
                  {/* The link's ::after stretches over the row, so the whole row is one click target. */}
                  <Link href={service.href} className="c-card-link">
                    {service.name}
                  </Link>
                </h3>
                <p className="c-product-tagline">{service.shortDescription}</p>
              </div>
              <p className="c-product-meta">
                {meta.label && <span className="c-product-meta-label">{meta.label}</span>}
                <span className="c-product-meta-value">{meta.value}</span>
              </p>
              <div className="c-product-media">
                <Image
                  src={service.image.src}
                  alt={service.image.alt}
                  width={service.image.width}
                  height={service.image.height}
                  sizes="(min-width: 1280px) 20rem, (min-width: 1024px) 18rem, (min-width: 768px) 14rem, 100vw"
                  className="c-product-image"
                />
              </div>
              <span className="c-product-arrow" aria-hidden="true">
                <ArrowUpRight />
              </span>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
