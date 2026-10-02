import Image from 'next/image';
import { Section } from '@/components/ui/section';
import type { SectionProps } from './types';

export function TrustStrip({ section, data }: SectionProps<'trustStrip'>) {
  const { rating } = data.site.facts;
  return (
    <Section id={section.id} name="trustStrip" heading={section.heading} className="c-trust-strip">
      <dl className="grid gap-4 sm:grid-cols-3">
        {rating && (
          <div className="c-card">
            <dt className="text-sm text-muted-foreground">{section.ratingLabel}</dt>
            <dd className="text-2xl font-semibold">{rating.value} / 5</dd>
          </div>
        )}
        <div className="c-card">
          <dt className="text-sm text-muted-foreground">{section.warrantyLabel}</dt>
          <dd className="text-2xl font-semibold">{data.content.stats.warrantyYearsMax}</dd>
        </div>
        <div className="c-card">
          <dt className="text-sm text-muted-foreground">{section.jobsLabel}</dt>
          <dd className="text-2xl font-semibold">{data.content.stats.jobsCompleted}+</dd>
        </div>
      </dl>
      {section.partners.length > 0 && (
        <div className="c-partners mt-6">
          <p className="mb-2 text-sm text-muted-foreground">{section.partnersLabel}</p>
          <ul className="flex flex-wrap items-center gap-6">
            {section.partners.map((partner) => (
              <li key={partner.name}>
                {partner.logo ? (
                  <Image
                    src={partner.logo.src}
                    alt={partner.name}
                    width={partner.logo.width}
                    height={partner.logo.height}
                    className="h-8 w-auto"
                  />
                ) : (
                  <span className="font-medium">{partner.name}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Section>
  );
}
