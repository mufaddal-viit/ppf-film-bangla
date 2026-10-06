import type { ReactNode } from 'react';
import type { SectionKey } from '@/lib/config/schema';
import type { SectionData } from '@/lib/content';
import { ContactCta } from './contact-cta';
import { Facility } from './facility';
import { Faq } from './faq';
import { Hero } from './hero';
import { Packages } from './packages';
import { Climate, WhyChooseUs } from './points';
import { Portfolio } from './portfolio';
import { Process } from './process';
import { Reviews } from './reviews';
import { ServicesGrid } from './services-grid';
import { Showcase } from './showcase';
import { TrustStrip } from './trust-strip';
import type { SectionOf, SectionProps } from './types';

type SectionComponent<K extends SectionKey> = (props: SectionProps<K>) => ReactNode | Promise<ReactNode>;

/**
 * Section key -> component. To add a section: add its key to SECTION_KEYS
 * (src/lib/config/schema.ts), its copy schema (src/lib/content/schema.ts), and a component here.
 */
const registry: { [K in SectionKey]: SectionComponent<K> } = {
  hero: Hero,
  showcase: Showcase,
  trustStrip: TrustStrip,
  servicesGrid: ServicesGrid,
  climate: Climate,
  whyChooseUs: WhyChooseUs,
  packages: Packages,
  portfolio: Portfolio,
  facility: Facility,
  process: Process,
  reviews: Reviews,
  faq: Faq,
  contactCta: ContactCta,
};

function RenderSection<K extends SectionKey>({ section, data }: SectionProps<K>) {
  // TypeScript cannot correlate registry[section.key] with section's type; the mapped type above guarantees it.
  const Component = registry[section.key] as SectionComponent<K>;
  return <Component section={section} data={data} />;
}

/** Renders the ordered, enabled sections for a page from config/pages.ts. */
export function SectionList({ sections, data }: { sections: Array<SectionOf<SectionKey>>; data: SectionData }) {
  return sections.map((section) => <RenderSection key={section.id} section={section} data={data} />);
}
