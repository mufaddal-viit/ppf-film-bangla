import { Icon } from '@/components/ui/icon';
import { Section } from '@/components/ui/section';
import type { SectionProps } from './types';

type Point = SectionProps<'climate'>['section']['points'][number];

/**
 * One flat structure for every points section: index, icon, title, body and proof are direct
 * children of the row, so story.css can lay the same markup out as an editorial list, open
 * columns, wide bands or long-form rows (chosen per section from its id / data-section).
 */
function PointList({ points }: { points: readonly Point[] }) {
  return (
    <ul className="c-points">
      {points.map((point, index) => (
        <li key={point.title} className="c-points-item" data-reveal>
          <span aria-hidden="true" className="c-point-index">
            {String(index + 1).padStart(2, '0')}
          </span>
          <Icon name={point.icon} className="c-point-icon" />
          <h3 className="c-point-title">{point.title}</h3>
          <p className="c-point-body">{point.body}</p>
          {point.proof && <p className="c-point-proof">{point.proof}</p>}
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
