/**
 * Schema.org JSON-LD builders. Pure functions over view models so the same facts
 * (name, address, phone, hours, prices) appear in markup and structured data.
 */
import type { FaqView, ServiceView, SiteView, TestimonialView } from '@/lib/content';

export type JsonLd = { '@context': 'https://schema.org'; '@type': string } & Record<string, unknown>;

const ctx = 'https://schema.org' as const;
const ids = (siteUrl: string) => ({
  business: `${siteUrl}/#business`,
  organization: `${siteUrl}/#organization`,
  website: `${siteUrl}/#website`,
});

type SiteFacts = Pick<
  SiteView,
  | 'name'
  | 'legalName'
  | 'schemaType'
  | 'priceRange'
  | 'description'
  | 'phone'
  | 'email'
  | 'address'
  | 'geo'
  | 'mapUrl'
  | 'openingHours'
  | 'areaServedList'
  | 'social'
  | 'currency'
  | 'facts'
  | 'locales'
  | 'foundingYear'
>;

export function localBusinessJsonLd(
  site: SiteFacts,
  opts: { siteUrl: string; pageUrl: string; image: string; logo: string; reviews: TestimonialView[] | null },
): JsonLd {
  const rating = opts.reviews && site.facts.rating;
  return {
    '@context': ctx,
    '@type': site.schemaType,
    '@id': ids(opts.siteUrl).business,
    name: site.name,
    description: site.description,
    url: opts.pageUrl,
    telephone: site.phone.e164,
    email: site.email,
    image: opts.image,
    logo: opts.logo,
    priceRange: site.priceRange,
    currenciesAccepted: site.currency,
    ...(site.foundingYear && { foundingDate: String(site.foundingYear) }),
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${site.address.street}, ${site.address.area}`,
      addressLocality: site.address.city,
      addressRegion: site.address.emirate,
      addressCountry: site.address.country,
      ...(site.address.postalCode && { postalCode: site.address.postalCode }),
    },
    geo: { '@type': 'GeoCoordinates', latitude: site.geo.lat, longitude: site.geo.lng },
    hasMap: site.mapUrl,
    openingHoursSpecification: site.openingHours.map((slot) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: slot.days.map((d) => `https://schema.org/${d}`),
      opens: slot.opens,
      closes: slot.closes,
    })),
    areaServed: site.areaServedList.map((name) => ({ '@type': 'City', name })),
    sameAs: site.social.map((s) => s.url),
    parentOrganization: { '@id': ids(opts.siteUrl).organization },
    // Ratings and reviews only when explicitly enabled and backed by real data.
    ...(rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: rating.value,
        reviewCount: rating.count,
        bestRating: 5,
      },
    }),
    ...(opts.reviews &&
      opts.reviews.length > 0 && {
        review: opts.reviews.map((r) => ({
          '@type': 'Review',
          author: { '@type': 'Person', name: r.author },
          datePublished: r.date,
          reviewBody: r.text,
          reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5 },
        })),
      }),
  };
}

export function organizationJsonLd(site: SiteFacts, opts: { siteUrl: string; logo: string }): JsonLd {
  return {
    '@context': ctx,
    '@type': 'Organization',
    '@id': ids(opts.siteUrl).organization,
    name: site.name,
    legalName: site.legalName,
    url: opts.siteUrl,
    logo: opts.logo,
    sameAs: site.social.map((s) => s.url),
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: site.phone.e164,
      contactType: 'customer service',
      areaServed: site.address.country,
      availableLanguage: site.locales,
    },
  };
}

export function websiteJsonLd(site: SiteFacts, opts: { siteUrl: string; locale: string }): JsonLd {
  return {
    '@context': ctx,
    '@type': 'WebSite',
    '@id': ids(opts.siteUrl).website,
    url: opts.siteUrl,
    name: site.name,
    inLanguage: opts.locale,
    publisher: { '@id': ids(opts.siteUrl).organization },
  };
}

export function serviceJsonLd(
  service: Pick<ServiceView, 'name' | 'shortDescription' | 'priceFrom'> & { image: { src: string } },
  site: Pick<SiteFacts, 'areaServedList' | 'currency'>,
  opts: { siteUrl: string; pageUrl: string },
): JsonLd {
  return {
    '@context': ctx,
    '@type': 'Service',
    name: service.name,
    serviceType: service.name,
    description: service.shortDescription,
    url: opts.pageUrl,
    image: new URL(service.image.src, opts.siteUrl).toString(),
    provider: { '@id': ids(opts.siteUrl).business },
    areaServed: site.areaServedList.map((name) => ({ '@type': 'City', name })),
    ...(service.priceFrom !== null && {
      offers: {
        '@type': 'Offer',
        priceCurrency: site.currency,
        price: service.priceFrom,
        priceSpecification: {
          '@type': 'PriceSpecification',
          minPrice: service.priceFrom,
          priceCurrency: site.currency,
        },
        url: opts.pageUrl,
      },
    }),
  };
}

export function faqPageJsonLd(faqs: Array<Pick<FaqView, 'question' | 'answer'>>): JsonLd | null {
  if (faqs.length === 0) return null;
  return {
    '@context': ctx,
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; url: string }>): JsonLd {
  return {
    '@context': ctx,
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

const UNSAFE_IN_SCRIPT = new RegExp(`[<${String.fromCharCode(0x2028)}${String.fromCharCode(0x2029)}]`, 'g');
const BACKSLASH = String.fromCharCode(92);

/** JSON for a <script type="application/ld+json">, escaped so content cannot close the tag. */
export function serializeJsonLd(data: JsonLd): string {
  return JSON.stringify(data).replace(
    UNSAFE_IN_SCRIPT,
    (ch) => `${BACKSLASH}u${ch.charCodeAt(0).toString(16).padStart(4, '0')}`,
  );
}
