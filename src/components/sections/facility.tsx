import Image from 'next/image';
import { Section } from '@/components/ui/section';
import { formatNumber } from '@/lib/content/format';
import type { SectionProps } from './types';

export function Facility({ section, data }: SectionProps<'facility'>) {
  return (
    <Section id={section.id} name="facility" heading={section.heading} intro={section.intro} className="c-facility">
      {section.stats.length > 0 && (
        <dl className="c-stats mb-8 grid gap-4 sm:grid-cols-3">
          {section.stats.map((stat) => (
            <div key={stat.label} className="c-card">
              <dt className="text-sm text-muted-foreground">{stat.label}</dt>
              <dd className="text-2xl font-semibold">
                {'fact' in stat.value
                  ? data.content.stats[stat.value.fact]
                  : formatNumber(stat.value.number, data.locale, data.site.region)}
                {stat.suffix}
              </dd>
            </div>
          ))}
        </dl>
      )}
      <ul className="c-grid">
        {section.photos.map((photo) => (
          <li key={photo.src}>
            <Image
              src={photo.src}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="h-auto w-full rounded-md"
            />
          </li>
        ))}
      </ul>
    </Section>
  );
}
