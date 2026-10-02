import { getTranslations } from 'next-intl/server';
import { Section } from '@/components/ui/section';
import type { SectionProps } from './types';

export async function Process({ section, data }: SectionProps<'process'>) {
  const t = await getTranslations({ locale: data.locale, namespace: 'process' });
  return (
    <Section id={section.id} name="process" heading={section.heading} intro={section.intro} className="c-process">
      <ol className="c-grid lg:grid-cols-4">
        {section.steps.map((step, index) => (
          <li key={step.title} className="c-card c-step flex flex-col gap-2">
            <span className="c-step-number text-sm text-muted-foreground">{t('step', { number: index + 1 })}</span>
            <h3 className="text-lg font-semibold">{step.title}</h3>
            <p className="text-muted-foreground">{step.body}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
