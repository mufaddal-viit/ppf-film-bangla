import { Section } from '@/components/ui/section';
import { formatNumber } from '@/lib/content/format';
import type { SectionProps } from './types';

export function TrustStrip({ section, data }: SectionProps<'trustStrip'>) {
  const services = data.content.services.map((s) => s.name);
  return (
    <Section
      id={section.id}
      name="trustStrip"
      heading={section.heading}
      intro={section.intro}
      tone="inverse"
      className="c-trust-strip"
    >
      {section.stats.length > 0 && (
        <dl className="c-stats">
          {section.stats.map((stat) => (
            <div key={stat.label} className="c-stat">
              <dt className="c-stat-label">{stat.label}</dt>
              <dd className="c-stat-value">
                {'fact' in stat.value
                  ? data.content.stats[stat.value.fact]
                  : formatNumber(stat.value.number, data.locale, data.site.region)}
                {stat.suffix}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {/* Decorative ticker of the product names; the real links live in the products grid. */}
      <div aria-hidden="true" className="c-marquee">
        {[0, 1].map((copy) => (
          <ul key={copy} className="c-marquee-track">
            {services.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        ))}
      </div>
    </Section>
  );
}
