import { JsonLd } from '@/components/seo/json-ld';
import { Section } from '@/components/ui/section';
import type { FaqView } from '@/lib/content';
import { faqPageJsonLd } from '@/lib/seo/jsonld';
import type { SectionProps } from './types';

/** Accordion built on <details>: keyboard accessible and readable without JavaScript. */
export function FaqList({ faqs }: { faqs: FaqView[] }) {
  return (
    <div className="c-faq-list space-y-2">
      {faqs.map((faq) => (
        <details key={faq.id} className="c-card c-faq-item">
          <summary className="cursor-pointer font-medium">{faq.question}</summary>
          <p className="mt-2 text-muted-foreground">{faq.answer}</p>
        </details>
      ))}
      <JsonLd data={faqPageJsonLd(faqs)} />
    </div>
  );
}

export function Faq({ section, data }: SectionProps<'faq'>) {
  const faqs =
    section.faqIds.length === 0
      ? data.content.faqs.filter((f) => !f.serviceSlug)
      : section.faqIds.map((id) => data.content.faqs.find((f) => f.id === id)).filter((f) => f !== undefined);
  if (faqs.length === 0) return null;

  return (
    <Section id={section.id} name="faq" heading={section.heading} intro={section.intro} className="c-faq">
      <FaqList faqs={faqs} />
    </Section>
  );
}
