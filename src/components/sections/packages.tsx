import { getTranslations } from 'next-intl/server';
import { CtaLink } from '@/components/ui/cta-link';
import { Section } from '@/components/ui/section';
import type { SectionProps } from './types';

export async function Packages({ section, data }: SectionProps<'packages'>) {
  const t = await getTranslations({ locale: data.locale, namespace: 'pricing' });
  const packages =
    section.packageIds.length === 0
      ? data.content.packages
      : data.content.packages.filter((p) => section.packageIds.includes(p.id));

  return (
    <Section id={section.id} name="packages" heading={section.heading} intro={section.intro} className="c-packages">
      <ul className="c-grid">
        {packages.map((pkg) => (
          <li key={pkg.id}>
            <article
              className="c-card c-package flex h-full flex-col gap-3"
              data-highlighted={pkg.highlighted || undefined}
            >
              {pkg.highlighted && <p className="c-badge">{t('popular')}</p>}
              <h3 className="text-lg font-semibold">{pkg.name}</h3>
              <p className="text-muted-foreground">{pkg.description}</p>
              <p className="c-price c-package-price">{t('from', { price: pkg.priceFromLabel })}</p>
              <div>
                <p className="text-sm font-medium">{t('includes')}</p>
                <ul className="c-checklist">
                  {pkg.includes.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </article>
          </li>
        ))}
      </ul>
      <div className="c-section-cta">
        <CtaLink
          cta={section.cta}
          variant="primary"
          location="packages"
          phone={data.site.phone.e164}
          whatsappUrl={data.whatsappUrl}
        />
      </div>
    </Section>
  );
}
