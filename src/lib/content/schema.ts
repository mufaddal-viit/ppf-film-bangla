import { z } from 'zod';
import type { SectionKey } from '@/lib/config/schema';
import { leadTypeSchema } from '@/lib/config/schema';
import { ICON_NAMES } from '@/lib/icons';

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const text = z.string().trim().min(1);

const imageSchema = z.object({
  src: z.string().startsWith('/'),
  alt: z.string(), // empty string only for purely decorative images
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

const seoSchema = z.object({ title: text.max(70), description: text.max(170) });

export const ctaSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('whatsapp'), label: text }),
  z.object({ action: z.literal('call'), label: text }),
  z.object({ action: z.literal('route'), label: text, href: z.string().startsWith('/') }),
]);

const pointSchema = z.object({ icon: z.enum(ICON_NAMES), title: text, body: text, proof: text.optional() });

const statSchema = z.object({
  label: text,
  value: z.union([z.object({ fact: z.enum(['jobsCompleted', 'warrantyYearsMax']) }), z.object({ number: z.number() })]),
  suffix: z.string().optional(),
});

// ---------------------------------------------------------------- section copy, one schema per section key

const sectionContentSchemas = {
  hero: z.object({
    eyebrow: text.optional(),
    /** Oversized brand word behind the car. Decorative: the heading is the page's <h1>. */
    wordmark: text,
    heading: text,
    /** Part of `heading` to print in the primary colour. Must appear in `heading`. */
    headingHighlight: text.optional(),
    subheading: text,
    /** Spec row under the heading. `value` accepts the tokens listed in src/lib/content/index.ts. */
    stats: z.array(z.object({ icon: z.enum(ICON_NAMES), value: text, label: text })).max(5),
    primaryCta: ctaSchema,
    secondaryCta: ctaSchema,
    media: z
      .discriminatedUnion('type', [
        z.object({ type: z.literal('image'), image: imageSchema }),
        z.object({ type: z.literal('video'), src: z.string().startsWith('/'), poster: imageSchema }),
      ])
      .nullable(),
    serviceChips: z.array(slug),
  }),
  showcase: z.object({
    heading: text,
    intro: text.optional(),
    slides: z
      .array(z.object({ image: imageSchema, title: text, body: text }))
      .min(2)
      .max(6),
  }),
  trustStrip: z.object({ heading: text, intro: text.optional(), stats: z.array(statSchema).max(4) }),
  servicesGrid: z.object({
    heading: text,
    intro: text.optional(),
    /** Empty means "all services in catalog order". */
    serviceSlugs: z.array(slug),
  }),
  climate: z.object({ heading: text, intro: text, points: z.array(pointSchema).nonempty() }),
  whyChooseUs: z.object({ heading: text, intro: text.optional(), points: z.array(pointSchema).nonempty() }),
  packages: z.object({
    heading: text,
    intro: text.optional(),
    /** Empty means "all packages". */
    packageIds: z.array(slug),
    cta: ctaSchema,
  }),
  portfolio: z.object({
    heading: text,
    intro: text.optional(),
    showFilters: z.boolean(),
    reels: z.array(z.object({ title: text, src: z.string().startsWith('/'), poster: imageSchema })),
  }),
  facility: z.object({
    heading: text,
    intro: text,
    photos: z.array(imageSchema),
    stats: z.array(statSchema),
  }),
  process: z.object({
    heading: text,
    intro: text.optional(),
    steps: z.array(z.object({ title: text, body: text })).nonempty(),
  }),
  reviews: z.object({ heading: text, intro: text.optional() }),
  faq: z.object({
    heading: text,
    intro: text.optional(),
    /** Empty means "all general FAQs" (those without a serviceSlug). */
    faqIds: z.array(slug),
  }),
  contactCta: z.object({
    heading: text,
    intro: text,
    formVariant: leadTypeSchema,
    showMap: z.boolean(),
  }),
} satisfies Record<SectionKey, z.ZodType>;

const s = sectionContentSchemas;
/** A section copy entry carries its section key so the loader can check it matches config/pages.ts. */
const sectionCopySchema = z.discriminatedUnion('key', [
  s.hero.extend({ key: z.literal('hero') }),
  s.showcase.extend({ key: z.literal('showcase') }),
  s.trustStrip.extend({ key: z.literal('trustStrip') }),
  s.servicesGrid.extend({ key: z.literal('servicesGrid') }),
  s.climate.extend({ key: z.literal('climate') }),
  s.whyChooseUs.extend({ key: z.literal('whyChooseUs') }),
  s.packages.extend({ key: z.literal('packages') }),
  s.portfolio.extend({ key: z.literal('portfolio') }),
  s.facility.extend({ key: z.literal('facility') }),
  s.process.extend({ key: z.literal('process') }),
  s.reviews.extend({ key: z.literal('reviews') }),
  s.faq.extend({ key: z.literal('faq') }),
  s.contactCta.extend({ key: z.literal('contactCta') }),
]);

// ---------------------------------------------------------------- locale bundle

const serviceContentSchema = z.object({
  slug,
  name: text,
  shortDescription: text.max(160),
  /** Self-contained direct answer shown first on the service page (AEO). */
  answer: text,
  body: z.array(text).nonempty(),
  highlights: z.array(text),
  imageAlt: text,
  seo: seoSchema,
});

const faqSchema = z.object({ id: slug, question: text, answer: text, serviceSlug: slug.optional() });

const testimonialSchema = z.object({
  id: slug,
  author: text,
  rating: z.number().int().min(1).max(5),
  text,
  date: z.iso.date(),
  source: text,
  vehicle: text.optional(),
});

const portfolioItemSchema = z.object({
  id: slug,
  title: text,
  serviceSlug: slug,
  vehicle: text,
  image: imageSchema,
});

const pageCopySchema = z.object({
  title: text,
  intro: text.optional(),
  seo: seoSchema,
  whatsappMessage: text.optional(),
});

export const localeContentSchema = z.object({
  common: z.object({
    tagline: text,
    /** Used for meta descriptions, LocalBusiness JSON-LD and llms.txt. */
    businessDescription: text,
    whatsappMessage: text,
  }),
  pages: z.object({
    home: pageCopySchema,
    services: pageCopySchema,
    gallery: pageCopySchema,
    prices: pageCopySchema,
    about: pageCopySchema,
    contact: pageCopySchema,
    blog: pageCopySchema,
    privacyPolicy: pageCopySchema,
    terms: pageCopySchema,
    notFound: pageCopySchema,
  }),
  services: z.array(serviceContentSchema).nonempty(),
  packages: z.array(z.object({ id: slug, name: text, description: text, includes: z.array(text).nonempty() })),
  faqs: z.array(faqSchema),
  testimonials: z.array(testimonialSchema),
  portfolio: z.array(portfolioItemSchema),
  /** Section copy keyed by the contentRef used in config/pages.ts. */
  sections: z.record(z.string(), sectionCopySchema),
});

export type LocaleContentInput = z.input<typeof localeContentSchema>;
export type LocaleContent = z.infer<typeof localeContentSchema>;
export type Cta = z.infer<typeof ctaSchema>;
export type PageCopyKey = keyof LocaleContent['pages'];

export const blogFrontmatterSchema = z.object({
  title: text.max(70),
  description: text.max(170),
  publishedAt: z.iso.date(),
  updatedAt: z.iso.date().optional(),
  author: text,
  draft: z.boolean().default(false),
});
export type BlogFrontmatter = z.infer<typeof blogFrontmatterSchema>;
