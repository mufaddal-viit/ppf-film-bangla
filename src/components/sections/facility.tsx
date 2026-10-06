import Image from 'next/image';
import { Section } from '@/components/ui/section';
import { formatNumber } from '@/lib/content/format';
import type { SectionProps } from './types';

export function Facility({ section, data }: SectionProps<'facility'>) {
  const [lead, ...rest] = section.photos;

  return (
    <Section id={section.id} name="facility" heading={section.heading} intro={section.intro} className="c-facility">
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

      <div className="c-promise">
        {lead && (
          <div className="c-promise-lead" data-reveal>
            <div className="c-promise-lead-media">
              <Image
                src={lead.src}
                alt={lead.alt}
                width={lead.width}
                height={lead.height}
                sizes="100vw"
                className="c-promise-image"
              />
            </div>
          </div>
        )}

        {rest.length > 0 && (
          <ul className="c-promise-pair">
            {rest.map((photo) => (
              <li key={photo.src} className="c-promise-photo" data-reveal>
                <div className="c-promise-frame">
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    width={photo.width}
                    height={photo.height}
                    sizes="(min-width: 1024px) 40vw, (min-width: 640px) 50vw, 75vw"
                    className="c-promise-image"
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Section>
  );
}
