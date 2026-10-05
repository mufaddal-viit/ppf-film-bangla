import Image from 'next/image';
import { Section } from '@/components/ui/section';
import { formatNumber } from '@/lib/content/format';
import type { SectionProps } from './types';

export function Facility({ section, data }: SectionProps<'facility'>) {
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
      <ul className="c-mosaic">
        {section.photos.map((photo) => (
          <li key={photo.src} className="c-mosaic-item">
            <Image
              src={photo.src}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              sizes="(min-width: 1024px) 60vw, 100vw"
              className="c-mosaic-image"
            />
          </li>
        ))}
      </ul>
    </Section>
  );
}
