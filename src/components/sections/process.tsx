import { getTranslations } from 'next-intl/server';
import { Section } from '@/components/ui/section';
import type { SectionProps } from './types';

export async function Process({ section, data }: SectionProps<'process'>) {
  const t = await getTranslations({ locale: data.locale, namespace: 'process' });
  return (
    <Section
      id={section.id}
      name="process"
      heading={section.heading}
      intro={section.intro}
      tone="inverse"
      className="c-process"
    >
      <ol className="c-steps">
        {section.steps.map((step, index) => (
          <li key={step.title} className="c-step">
            <span className="c-step-number">
              <span className="sr-only">{t('step', { number: index + 1 })}</span>
              <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
            </span>
            <h3 className="text-lg font-semibold">{step.title}</h3>
            <p className="text-muted-foreground">{step.body}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
