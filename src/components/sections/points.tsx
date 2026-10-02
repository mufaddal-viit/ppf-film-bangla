import { Icon } from '@/components/ui/icon';
import { Section } from '@/components/ui/section';
import type { SectionProps } from './types';

type Point = SectionProps<'climate'>['section']['points'][number];

function PointList({ points }: { points: readonly Point[] }) {
  return (
    <ul className="c-grid">
      {points.map((point) => (
        <li key={point.title} className="c-card c-point flex flex-col gap-2">
          <Icon name={point.icon} />
          <h3 className="text-lg font-semibold">{point.title}</h3>
          <p className="text-muted-foreground">{point.body}</p>
          {point.proof && <p className="c-point-proof text-sm">{point.proof}</p>}
        </li>
      ))}
    </ul>
  );
}

export function Climate({ section }: SectionProps<'climate'>) {
  return (
    <Section id={section.id} name="climate" heading={section.heading} intro={section.intro} className="c-climate">
      <PointList points={section.points} />
    </Section>
  );
}

export function WhyChooseUs({ section }: SectionProps<'whyChooseUs'>) {
  return (
    <Section
      id={section.id}
      name="whyChooseUs"
      heading={section.heading}
      intro={section.intro}
      className="c-why-choose-us"
    >
      <PointList points={section.points} />
    </Section>
  );
}
