/**
 * The content loader: the only path from /config and /content to components.
 * Everything returned here is validated and resolved into plain view models.
 */
import 'server-only';
import { parsePhoneNumberWithError } from 'libphonenumber-js';
import { createTranslator } from 'next-intl';
import { cache } from 'react';
import {
  catalogConfig,
  featuresConfig,
  formsConfig,
  integrationsConfig,
  navigationConfig,
  pagesConfig,
  siteConfig,
  themeConfig,
} from '@/lib/config';
import type { LeadType, NavHref, PageKey } from '@/lib/config/schema';
import { parseOrThrow } from '@/lib/config';
import { publicEnv } from '@/lib/env.public';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import {
  fillTokens,
  formatDate,
  formatList,
  formatNumber,
  formatPrice,
  groupConsecutiveDays,
  weekdayName,
} from './format';
import { localeContentSchema, type LocaleContent, type PageCopyKey } from './schema';
import { fileContentSource, type ContentSource } from './source';

const source: ContentSource = fileContentSource;
const region = siteConfig.locale.phoneRegion;

type Messages = Awaited<ReturnType<ContentSource['loadMessages']>>;

export const getMessages = cache((locale: string) => source.loadMessages(locale));

function isRtl(locale: string): boolean {
  return siteConfig.locale.rtlLocales.includes(locale);
}

export const ROUTES = {
  home: '/',
  services: '/services',
  service: (slug: string) => `/services/${slug}`,
  gallery: '/gallery',
  prices: '/prices',
  about: '/about',
  contact: '/contact',
  blog: '/blog',
  blogPost: (slug: string) => `/blog/${slug}`,
  privacyPolicy: '/privacy-policy',
  terms: '/terms',
} as const;

// ---------------------------------------------------------------- site (config + translated labels)

function openingHours(locale: string, messages: Messages) {
  const t = createTranslator({ locale, messages, namespace: 'days' });
  const hours = siteConfig.hours.flatMap((slot) =>
    groupConsecutiveDays(slot.days).map(([from, to]) => ({
      days:
        from === to
          ? weekdayName(from, locale, region)
          : t('range', { from: weekdayName(from, locale, region), to: weekdayName(to, locale, region) }),
      time: `${slot.opens}–${slot.closes}`,
    })),
  );
  const text = formatList(
    hours.map((h) => `${h.days} ${h.time}`),
    locale,
    region,
  );
  return { hours, text };
}

export const getSite = cache(async (locale: string) => {
  const messages = await getMessages(locale);
  const content = await getContent(locale);
  const t = createTranslator({ locale, messages });
  const { business, contact, facts } = siteConfig;
  const { hours, text: hoursText } = openingHours(locale, messages);

  return {
    locale,
    region,
    dir: isRtl(locale) ? ('rtl' as const) : ('ltr' as const),
    name: business.name,
    shortName: business.shortName ?? business.name,
    legalName: business.legalName,
    schemaType: business.schemaType,
    priceRange: business.priceRange,
    foundingYear: business.foundingYear ?? null,
    openingHours: siteConfig.hours,
    areaServedList: contact.areaServed,
    locales: siteConfig.locale.locales,
    logo: { ...business.logo, alt: business.name },
    tagline: content.common.tagline,
    description: content.common.businessDescription,
    currency: siteConfig.locale.currency,
    timezone: siteConfig.locale.timezone,
    phone: { e164: contact.phone, display: parsePhoneNumberWithError(contact.phone).formatInternational() },
    whatsapp: {
      enabled: integrationsConfig.whatsapp.enabled,
      e164: integrationsConfig.whatsapp.number,
      url: buildWhatsAppUrl(integrationsConfig.whatsapp.number, content.common.whatsappMessage),
    },
    email: contact.email,
    address: contact.address,
    addressLines: [contact.address.street, contact.address.area, `${contact.address.city}, ${contact.address.emirate}`],
    geo: contact.geo,
    mapUrl: contact.mapUrl,
    mapEmbedUrl: contact.mapEmbedUrl ?? null,
    areaServed: formatList(contact.areaServed, locale, region),
    hours,
    hoursText,
    social: siteConfig.social.map((s) => ({ ...s, label: t(`social.${s.platform}`) })),
    payments: siteConfig.paymentMethods.map((m) => ({ method: m, label: t(`payments.${m}`) })),
    facts: {
      warrantyYearsMax: facts.warrantyYearsMax,
      jobsCompleted: facts.jobsCompleted,
      rating: facts.rating,
    },
  };
});
export type SiteView = Awaited<ReturnType<typeof getSite>>;

// ---------------------------------------------------------------- content

function checkReferences(content: LocaleContent, locale: string) {
  const where = `content/${locale}`;
  const serviceSlugs = new Set(catalogConfig.services.map((s) => s.slug));
  const contentSlugs = new Set(content.services.map((s) => s.slug));
  for (const slug of serviceSlugs) {
    if (!contentSlugs.has(slug))
      throw new Error(`${where}/services.ts is missing service "${slug}" from config/catalog.ts`);
  }
  for (const slug of contentSlugs) {
    if (!serviceSlugs.has(slug))
      throw new Error(`${where}/services.ts has service "${slug}" that is not in config/catalog.ts`);
  }
  const packageIds = new Set(content.packages.map((p) => p.id));
  for (const pkg of catalogConfig.packages) {
    if (!packageIds.has(pkg.id))
      throw new Error(`${where}/index.ts is missing package "${pkg.id}" from config/catalog.ts`);
  }
  const faqIds = new Set(content.faqs.map((f) => f.id));
  for (const [page, { sections }] of Object.entries(pagesConfig)) {
    for (const entry of sections) {
      const copy = content.sections[entry.contentRef];
      if (!copy)
        throw new Error(`${where}/sections.ts is missing "${entry.contentRef}" (used by config/pages.ts ${page})`);
      if (copy.key !== entry.key) {
        throw new Error(
          `${where}/sections.ts "${entry.contentRef}" is a "${copy.key}" section but config/pages.ts ${page} uses it as "${entry.key}"`,
        );
      }
    }
  }
  for (const [id, copy] of Object.entries(content.sections)) {
    const slugs = copy.key === 'hero' ? copy.serviceChips : copy.key === 'servicesGrid' ? copy.serviceSlugs : [];
    for (const slug of slugs) {
      if (!serviceSlugs.has(slug)) throw new Error(`${where}/sections.ts "${id}" references unknown service "${slug}"`);
    }
    if (copy.key === 'hero' && copy.headingHighlight && !copy.heading.includes(copy.headingHighlight)) {
      throw new Error(`${where}/sections.ts "${id}" headingHighlight must be part of its heading`);
    }
    if (copy.key === 'faq') {
      for (const faqId of copy.faqIds) {
        if (!faqIds.has(faqId)) throw new Error(`${where}/sections.ts "${id}" references unknown FAQ "${faqId}"`);
      }
    }
    if (copy.key === 'packages') {
      for (const pkgId of copy.packageIds) {
        if (!packageIds.has(pkgId))
          throw new Error(`${where}/sections.ts "${id}" references unknown package "${pkgId}"`);
      }
    }
  }
  for (const item of [...content.faqs, ...content.portfolio]) {
    if (item.serviceSlug && !serviceSlugs.has(item.serviceSlug)) {
      throw new Error(`${where}: "${item.id}" references unknown service "${item.serviceSlug}"`);
    }
  }
}

export const getContent = cache(async (locale: string) => {
  const content = parseOrThrow(localeContentSchema, await source.loadContent(locale), `content/${locale}`);
  checkReferences(content, locale);

  const messages = await getMessages(locale);
  const t = createTranslator({ locale, messages, namespace: 'units' });
  const { business, contact, facts, locale: localeConfig } = siteConfig;
  const price = (amount: number) => formatPrice(amount, localeConfig.currency, locale, region);

  const baseTokens: Record<string, string | null> = {
    businessName: business.name,
    city: contact.address.city,
    area: contact.address.area,
    areaServed: formatList(contact.areaServed, locale, region),
    hours: openingHours(locale, messages).text,
    warrantyYearsMax: t('years', { value: facts.warrantyYearsMax }),
  };

  const services = catalogConfig.services.map((cat) => {
    // checkReferences guarantees the match
    const copy = content.services.find((s) => s.slug === cat.slug)!;
    const priceFromLabel = cat.priceFrom === null ? null : price(cat.priceFrom);
    const warrantyLabel = cat.warrantyYears === null ? null : t('years', { value: cat.warrantyYears });
    const turnaroundLabel = cat.turnaround === null ? null : t(cat.turnaround.unit, { value: cat.turnaround.value });
    const tokens = {
      ...baseTokens,
      priceFrom: priceFromLabel,
      warrantyYears: warrantyLabel,
      turnaround: turnaroundLabel,
    };
    return {
      slug: cat.slug,
      href: ROUTES.service(cat.slug),
      icon: cat.icon,
      name: copy.name,
      shortDescription: copy.shortDescription,
      answer: fillTokens(copy.answer, tokens, `content/${locale}/services.ts ${cat.slug}.answer`),
      body: copy.body,
      highlights: copy.highlights,
      image: { ...cat.image, alt: copy.imageAlt },
      seo: copy.seo,
      priceFrom: cat.priceFrom,
      priceFromLabel,
      warrantyYears: cat.warrantyYears,
      warrantyLabel,
      turnaroundLabel,
    };
  });

  const packages = catalogConfig.packages.map((cat) => {
    const copy = content.packages.find((p) => p.id === cat.id)!;
    return { ...copy, ...cat, priceFromLabel: price(cat.priceFrom) };
  });

  const faqs = content.faqs.map((faq) => ({
    ...faq,
    question: fillTokens(faq.question, baseTokens, `content/${locale}/faqs.ts ${faq.id}`),
    answer: fillTokens(faq.answer, baseTokens, `content/${locale}/faqs.ts ${faq.id}`),
  }));

  const serviceName = new Map(services.map((s) => [s.slug, s.name]));

  // Tokens for hero stat values, so the spec row never restates a number that lives in config.
  const heroTokens: Record<string, string | null> = {
    ...baseTokens,
    yearsInBusiness:
      business.foundingYear === undefined
        ? null
        : formatNumber(new Date().getFullYear() - business.foundingYear, locale, region),
    warrantyYearsMaxNumber: formatNumber(facts.warrantyYearsMax, locale, region),
    jobsCompleted: formatNumber(facts.jobsCompleted, locale, region),
    ratingValue: facts.rating ? formatNumber(facts.rating.value, locale, region) : null,
    /** Starting price of the first (flagship) service in config/catalog.ts. */
    flagshipPriceFrom: services[0]?.priceFromLabel ?? null,
  };
  const sections = Object.fromEntries(
    Object.entries(content.sections).map(([id, copy]) => [
      id,
      copy.key === 'hero'
        ? {
            ...copy,
            stats: copy.stats.map((stat) => ({
              ...stat,
              value: fillTokens(stat.value, heroTokens, `content/${locale}/sections.ts ${id} stats`),
            })),
          }
        : copy,
    ]),
  );

  return {
    common: content.common,
    pages: content.pages,
    services,
    packages,
    faqs,
    testimonials: content.testimonials.map((r) => ({ ...r, dateLabel: formatDate(r.date, locale, region) })),
    portfolio: content.portfolio.map((p) => ({ ...p, serviceName: serviceName.get(p.serviceSlug) ?? p.serviceSlug })),
    sections,
    stats: {
      jobsCompleted: formatNumber(facts.jobsCompleted, locale, region),
      warrantyYearsMax: formatNumber(facts.warrantyYearsMax, locale, region),
    },
  };
});

export type ResolvedContent = Awaited<ReturnType<typeof getContent>>;
export type ServiceView = ResolvedContent['services'][number];
export type FaqView = ResolvedContent['faqs'][number];
export type TestimonialView = ResolvedContent['testimonials'][number];
export type PortfolioView = ResolvedContent['portfolio'][number];
export type SectionCopy = LocaleContent['sections'][string];

export function serviceSlugs(): string[] {
  return catalogConfig.services.map((s) => s.slug);
}

export async function getPageCopy(page: PageCopyKey, locale: string) {
  return (await getContent(locale)).pages[page];
}

export async function getPageSections(page: PageKey, locale: string): Promise<Array<SectionCopy & { id: string }>> {
  const content = await getContent(locale);
  return pagesConfig[page].sections
    .filter((entry) => entry.enabled)
    .map((entry) => ({ ...content.sections[entry.contentRef]!, id: entry.contentRef }));
}

/** WhatsApp link with the page's prefilled message, falling back to the site default. */
export async function getWhatsAppUrl(locale: string, page?: PageCopyKey): Promise<string> {
  const content = await getContent(locale);
  const message = (page && content.pages[page].whatsappMessage) || content.common.whatsappMessage;
  return buildWhatsAppUrl(integrationsConfig.whatsapp.number, message);
}

// ---------------------------------------------------------------- navigation

export type NavLink = {
  label: string;
  href: string;
  slug?: string;
  icon?: string;
  description?: string;
  warrantyLabel?: string | null;
  badge?: string;
  category?: 'ppf' | 'window-film' | 'general';
};
export type NavItem = NavLink & { children?: NavLink[] };

export const getNavigation = cache(async (locale: string) => {
  const messages = await getMessages(locale);
  const content = await getContent(locale);
  const nav = messages.nav as Record<string, string>;
  const label = (key: string) => {
    const value = nav[key];
    if (value === undefined)
      throw new Error(`content/${locale}/messages.json is missing nav.${key} (used by config/navigation.ts)`);
    return value;
  };
  const hrefOf = (href: NavHref) =>
    'route' in href ? href.route : 'service' in href ? ROUTES.service(href.service) : ROUTES.services;
  const enabled = (link: { href: NavHref }) =>
    featuresConfig.blog || !('route' in link.href && link.href.route === ROUTES.blog);

  const header: NavItem[] = navigationConfig.header.filter(enabled).map((item) => ({
    label: label(item.labelKey),
    href: hrefOf(item.href),
    ...('servicesMenu' in item.href && {
      children: [
        ...content.services.map((s) => ({
          label: s.name,
          href: s.href,
          slug: s.slug,
          icon: s.icon,
          description: s.shortDescription,
          warrantyLabel: s.warrantyLabel,
          badge:
            s.slug === 'apex'
              ? 'Flagship'
              : s.slug === 'stealth'
                ? 'Satin'
                : s.slug === 'frozen'
                  ? 'Matte'
                  : s.slug === 'solaris'
                    ? 'Ceramic'
                    : undefined,
          category: (s.slug === 'solaris' || s.slug === 'luminox' ? 'window-film' : 'ppf') as 'ppf' | 'window-film',
        })),
        {
          label: label('allServices'),
          href: ROUTES.services,
          description: 'Compare all film series, specs & warranties',
          category: 'general' as const,
        },
      ],
    }),
  }));
  return {
    header,
    footer: navigationConfig.footer.map((group) => ({
      title: label(group.titleKey),
      links: group.links.filter(enabled).map((l) => ({ label: label(l.labelKey), href: hrefOf(l.href) })),
    })),
    legal: navigationConfig.legal.map((l) => ({ label: label(l.labelKey), href: l.href.route })),
  };
});
export type NavigationView = Awaited<ReturnType<typeof getNavigation>>;

// ---------------------------------------------------------------- lead form

export async function getLeadFormProps(variant: LeadType, locale: string) {
  const content = await getContent(locale);
  return {
    variant,
    fields: formsConfig.variants[variant].fields,
    serviceOptions: content.services.map((s) => ({ value: s.slug, label: s.name })),
    phoneRegion: region,
    privacyHref: ROUTES.privacyPolicy,
    turnstile: integrationsConfig.turnstile.enabled ? { siteKey: publicEnv.NEXT_PUBLIC_TURNSTILE_SITE_KEY } : null,
  };
}
export type LeadFormProps = Awaited<ReturnType<typeof getLeadFormProps>>;

// ---------------------------------------------------------------- everything a section may need

export async function getSectionData(locale: string, page?: PageCopyKey) {
  const [site, content, whatsappUrl, quote, contact, callback] = await Promise.all([
    getSite(locale),
    getContent(locale),
    getWhatsAppUrl(locale, page),
    getLeadFormProps('quote', locale),
    getLeadFormProps('contact', locale),
    getLeadFormProps('callback', locale),
  ]);
  return {
    locale,
    site,
    content,
    whatsappUrl,
    theme: { name: themeConfig.active, heroMode: themeConfig.heroMode ?? themeConfig.mode },
    leadForms: { quote, contact, callback },
    /** Review and AggregateRating JSON-LD only when enabled and the rating is real. */
    reviewStructuredData: featuresConfig.reviewStructuredData,
  };
}
export type SectionData = Awaited<ReturnType<typeof getSectionData>>;
