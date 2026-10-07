/**
 * Zod schemas for everything in /config.
 * Keep this file free of path aliases: next.config.ts imports it at build time.
 */
import { z } from 'zod';
import { ICON_NAMES } from '../icons';

const e164 = z.string().regex(/^\+[1-9]\d{6,14}$/, 'Must be an E.164 phone number, e.g. +971500000000');
const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Must be HH:mm');
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Must be a lowercase slug');
const cssValue = z.string().min(1);

export const weekdaySchema = z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);

const imageRefSchema = z.object({
  src: z.string().startsWith('/'),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

// ---------------------------------------------------------------- site

export const siteConfigSchema = z
  .object({
    business: z.object({
      name: z.string().min(1),
      /** One word for oversized lettering (footer wordmark). Defaults to `name`. */
      shortName: z.string().min(1).optional(),
      legalName: z.string().min(1),
      schemaType: z.enum(['AutomotiveBusiness', 'AutoBodyShop', 'AutoRepair', 'AutoWash']),
      logo: imageRefSchema,
      priceRange: z.string().min(1),
      foundingYear: z.number().int().min(1900).optional(),
    }),
    locale: z.object({
      locales: z.array(z.string().min(2)).nonempty(),
      defaultLocale: z.string().min(2),
      rtlLocales: z.array(z.string().min(2)),
      currency: z.string().length(3),
      timezone: z.string().min(1),
      phoneRegion: z.string().length(2),
    }),
    contact: z.object({
      phone: e164,
      whatsapp: e164,
      email: z.email(),
      address: z.object({
        street: z.string().min(1),
        area: z.string().min(1),
        city: z.string().min(1),
        emirate: z.string().min(1),
        country: z.string().length(2),
        postalCode: z.string().optional(),
      }),
      geo: z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) }),
      mapUrl: z.url(),
      mapEmbedUrl: z.url().optional(),
      areaServed: z.array(z.string().min(1)).nonempty(),
    }),
    hours: z.array(z.object({ days: z.array(weekdaySchema).nonempty(), opens: hhmm, closes: hhmm })),
    social: z.array(
      z.object({
        platform: z.enum(['instagram', 'facebook', 'tiktok', 'youtube', 'x', 'google']),
        url: z.url(),
      }),
    ),
    paymentMethods: z.array(z.enum(['cash', 'card', 'visa', 'mastercard', 'applePay', 'googlePay', 'tabby', 'tamara'])),
    facts: z.object({
      warrantyYearsMax: z.number().int().positive(),
      jobsCompleted: z.number().int().nonnegative(),
      /** null hides the rating everywhere, including AggregateRating JSON-LD. Only fill with real data. */
      rating: z
        .object({ value: z.number().min(1).max(5), count: z.number().int().positive(), source: z.string() })
        .nullable(),
    }),
  })
  .refine((c) => c.locale.locales.includes(c.locale.defaultLocale), {
    message: 'locale.defaultLocale must be one of locale.locales',
    path: ['locale', 'defaultLocale'],
  });

// ---------------------------------------------------------------- catalog (numbers shared by every locale)

export const catalogSchema = z.object({
  services: z
    .array(
      z.object({
        slug,
        icon: z.enum(ICON_NAMES),
        priceFrom: z.number().nonnegative().nullable(),
        warrantyYears: z.number().int().positive().nullable(),
        turnaround: z.object({ value: z.number().positive(), unit: z.enum(['hours', 'days']) }).nullable(),
        image: imageRefSchema,
      }),
    )
    .nonempty(),
  packages: z.array(
    z.object({
      id: slug,
      serviceSlug: slug,
      priceFrom: z.number().nonnegative(),
      highlighted: z.boolean(),
    }),
  ),
});

// ---------------------------------------------------------------- navigation

const navHrefSchema = z.union([
  z.object({ route: z.string().startsWith('/') }),
  z.object({ service: slug }),
  z.object({ servicesMenu: z.literal(true) }),
]);

export const navigationConfigSchema = z.object({
  header: z.array(z.object({ labelKey: z.string(), href: navHrefSchema })),
  footer: z.array(
    z.object({
      titleKey: z.string(),
      links: z.array(z.object({ labelKey: z.string(), href: navHrefSchema })),
    }),
  ),
  legal: z.array(z.object({ labelKey: z.string(), href: z.object({ route: z.string().startsWith('/') }) })),
});

// ---------------------------------------------------------------- sections and pages

const SECTION_KEYS = [
  'hero',
  'showcase',
  'trustStrip',
  'servicesGrid',
  'climate',
  'whyChooseUs',
  'packages',
  'portfolio',
  'facility',
  'process',
  'reviews',
  'faq',
  'contactCta',
] as const;
export const sectionKeySchema = z.enum(SECTION_KEYS);

const sectionEntrySchema = z.object({
  key: sectionKeySchema,
  enabled: z.boolean(),
  /** Id of the entry in content/{locale}/sections.ts */
  contentRef: z.string().min(1),
});

export const PAGE_KEYS = ['home', 'services', 'gallery', 'prices', 'about', 'contact'] as const;

export const pagesConfigSchema = z
  .record(z.enum(PAGE_KEYS), z.object({ sections: z.array(sectionEntrySchema) }))
  // The hero renders the page's only <h1>; other pages get theirs from the page header.
  .refine(
    (pages) =>
      Object.entries(pages).every(([page, { sections }]) =>
        page === 'home'
          ? sections.filter((s) => s.key === 'hero').length <= 1
          : sections.every((s) => s.key !== 'hero'),
      ),
    { message: 'The hero section can only be used once, on the home page' },
  );

export const layoutConfigSchema = z.object({
  topBar: z.object({ enabled: z.boolean() }),
  header: z.object({ enabled: z.boolean(), showQuoteButton: z.boolean() }),
  footer: z.object({ enabled: z.boolean() }),
  floatingActions: z.object({ enabled: z.boolean(), actions: z.array(z.enum(['call', 'map', 'whatsapp'])).nonempty() }),
});

// ---------------------------------------------------------------- theme

const colorTokensSchema = z.object({
  background: cssValue,
  surface: cssValue,
  foreground: cssValue,
  muted: cssValue,
  mutedForeground: cssValue,
  primary: cssValue,
  primaryForeground: cssValue,
  accent: cssValue,
  accentForeground: cssValue,
  border: cssValue,
  ring: cssValue,
  success: cssValue,
  warning: cssValue,
  danger: cssValue,
});

const FONT_KEYS = ['inter', 'archivo', 'ibmPlexArabic'] as const;
const fontKeySchema = z.enum(FONT_KEYS);

export const themeConfigSchema = z
  .object({
    active: z.string(),
    mode: z.enum(['light', 'dark']),
    /** Colour mode of the homepage hero stage only. Defaults to `mode`. */
    heroMode: z.enum(['light', 'dark']).optional(),
    themes: z.record(
      z.string(),
      z.object({
        fonts: z.object({
          body: fontKeySchema,
          heading: fontKeySchema,
          arabic: fontKeySchema,
          /** Oversized brand lettering (hero wordmark). Not swapped for the Arabic font in RTL. */
          display: fontKeySchema,
        }),
        radius: cssValue,
        spacingUnit: cssValue,
        containerWidth: cssValue,
        shadows: z.object({ sm: cssValue, md: cssValue, lg: cssValue }),
        modes: z.object({ dark: colorTokensSchema, light: colorTokensSchema.optional() }),
      }),
    ),
  })
  .refine((t) => t.active in t.themes, { message: 'theme.active must name a theme in theme.themes', path: ['active'] })
  .refine((t) => t.mode === 'dark' || t.themes[t.active]?.modes.light !== undefined, {
    message: 'theme.mode is "light" but the active theme has no light tokens',
    path: ['mode'],
  })
  .refine((t) => t.heroMode !== 'light' || t.themes[t.active]?.modes.light !== undefined, {
    message: 'theme.heroMode is "light" but the active theme has no light tokens',
    path: ['heroMode'],
  });

// ---------------------------------------------------------------- seo

export const seoConfigSchema = z.object({
  titleTemplate: z.string().includes('%s'),
  defaultOgImage: imageRefSchema,
  twitterHandle: z.string().startsWith('@').optional(),
  aiCrawlers: z.object({
    policy: z.enum(['allow', 'disallow']),
    userAgents: z.array(z.string().min(1)),
  }),
});

// ---------------------------------------------------------------- integrations

export const integrationsConfigSchema = z.object({
  gtm: z.object({ enabled: z.boolean(), containerId: z.string().regex(/^GTM-[A-Z0-9]+$/) }),
  /** `enabled: false` hides every WhatsApp link (top bar, contact section). */
  whatsapp: z.object({ enabled: z.boolean(), number: e164 }),
  turnstile: z.object({ enabled: z.boolean() }),
});

// ---------------------------------------------------------------- forms

const LEAD_FIELD_NAMES = [
  'name',
  'phone',
  'email',
  'vehicleMake',
  'vehicleModel',
  'vehicleYear',
  'service',
  'preferredTime',
  'message',
] as const;
export const leadFieldNameSchema = z.enum(LEAD_FIELD_NAMES);
const LEAD_TYPES = ['quote', 'contact', 'callback'] as const;
export const leadTypeSchema = z.enum(LEAD_TYPES);

export const formsConfigSchema = z.object({
  privacyPolicyVersion: z.string().min(1),
  variants: z.record(
    leadTypeSchema,
    z
      .object({
        fields: z.array(z.object({ name: leadFieldNameSchema, required: z.boolean() })).nonempty(),
      })
      .refine((v) => ['name', 'phone'].every((n) => v.fields.some((f) => f.name === n && f.required)), {
        message: 'Every form variant must include required "name" and "phone" fields',
      }),
  ),
});

// ---------------------------------------------------------------- security

const rateLimitSchema = z.object({
  requests: z.number().int().positive(),
  windowSeconds: z.number().int().positive(),
});

export const securityConfigSchema = z.object({
  rateLimits: z.object({
    quote: rateLimitSchema,
    contact: rateLimitSchema,
    callback: rateLimitSchema,
    adminLogin: rateLimitSchema,
  }),
  csp: z.object({
    extraScriptSrc: z.array(z.string()),
    extraConnectSrc: z.array(z.string()),
    extraImgSrc: z.array(z.string()),
    extraFrameSrc: z.array(z.string()),
  }),
});

// ---------------------------------------------------------------- features

export const featuresConfigSchema = z.object({
  blog: z.boolean(),
  /** Emit Review + AggregateRating JSON-LD. Only enable when testimonials and rating are real. */
  reviewStructuredData: z.boolean(),
});

export type SiteConfig = z.infer<typeof siteConfigSchema>;
export type Catalog = z.infer<typeof catalogSchema>;
export type NavigationConfig = z.infer<typeof navigationConfigSchema>;
export type NavHref = z.infer<typeof navHrefSchema>;
export type SectionKey = z.infer<typeof sectionKeySchema>;
export type PageKey = (typeof PAGE_KEYS)[number];
export type PagesConfig = z.infer<typeof pagesConfigSchema>;
export type LayoutConfig = z.infer<typeof layoutConfigSchema>;
export type ThemeConfig = z.infer<typeof themeConfigSchema>;
export type ColorTokens = z.infer<typeof colorTokensSchema>;
export type FontKey = z.infer<typeof fontKeySchema>;
export type SeoConfig = z.infer<typeof seoConfigSchema>;
export type IntegrationsConfig = z.infer<typeof integrationsConfigSchema>;
export type FormsConfig = z.infer<typeof formsConfigSchema>;
export type LeadFieldName = z.infer<typeof leadFieldNameSchema>;
export type LeadType = z.infer<typeof leadTypeSchema>;
export type SecurityConfig = z.infer<typeof securityConfigSchema>;
export type FeaturesConfig = z.infer<typeof featuresConfigSchema>;
export type Weekday = z.infer<typeof weekdaySchema>;
