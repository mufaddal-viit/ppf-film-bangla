import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Icon } from '@/components/ui/icon';
import { Section } from '@/components/ui/section';
import { Link } from '@/i18n/navigation';
import type { SectionProps } from './types';

export async function ServicesGrid({ section, data }: SectionProps<'servicesGrid'>) {
  const t = await getTranslations({ locale: data.locale, namespace: 'pricing' });
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
      <ul className="c-grid">
        {services.map((service) => (
          <li key={service.slug}>
            <article className="c-card c-service-card">
              <div className="c-service-media">
                <Image
                  src={service.image.src}
                  alt={service.image.alt}
                  width={service.image.width}
                  height={service.image.height}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="c-service-image"
                />
                <span className="c-service-icon">
                  <Icon name={service.icon} className="size-5" />
                </span>
              </div>
              <div className="c-service-body">
                <h3 className="c-card-title">
                  {/* The link's ::after stretches over the card, so the whole card is one click target. */}
                  <Link href={service.href} className="c-card-link">
                    {service.name}
                  </Link>
                </h3>
                <p className="text-muted-foreground">{service.shortDescription}</p>
                <p className="c-price c-service-price">
                  {service.priceFromLabel
                    ? t('from', { price: service.priceFromLabel })
                    : service.warrantyYears
                      ? t('warranty', { years: service.warrantyYears })
                      : t('onRequest')}
                  <ArrowUpRight aria-hidden="true" className="c-card-arrow size-5 rtl:-scale-x-100" />
                </p>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </Section>
  );
}
