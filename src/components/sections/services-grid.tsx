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
            <article className="c-card c-service-card flex h-full flex-col gap-2">
              <Icon name={service.icon} />
              <h3 className="text-lg font-semibold">
                <Link href={service.href}>{service.name}</Link>
              </h3>
              <p className="text-muted-foreground">{service.shortDescription}</p>
              <p className="c-price mt-auto font-medium">
                {service.priceFromLabel ? t('from', { price: service.priceFromLabel }) : t('onRequest')}
              </p>
            </article>
          </li>
        ))}
      </ul>
    </Section>
  );
}
