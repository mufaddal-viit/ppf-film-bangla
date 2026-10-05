import { describe, expect, it } from 'vitest';
import { getContent, getSite } from '@/lib/content';
import { breadcrumbJsonLd, faqPageJsonLd, localBusinessJsonLd, serializeJsonLd, serviceJsonLd } from '@/lib/seo/jsonld';

const siteUrl = 'https://www.example.ae';

describe('JSON-LD helpers', async () => {
  const site = await getSite('en');
  const content = await getContent('en');
  const opts = { siteUrl, pageUrl: `${siteUrl}/en`, image: `${siteUrl}/og.jpg`, logo: `${siteUrl}/logo.svg` };
  // Fixtures, so these tests do not depend on the live content having reviews, FAQs or prices.
  const reviews = [
    {
      id: 'review-1',
      author: 'Test customer',
      rating: 5,
      text: 'Great film.',
      date: '2026-09-01',
      dateLabel: 'September 1, 2026',
      source: 'Google',
    },
  ];
  const faqs = [{ id: 'faq-1', question: 'How long does the film last?', answer: 'Up to ten years.' }];

  it('builds LocalBusiness from config with consistent NAP and hours', () => {
    const data = localBusinessJsonLd(site, { ...opts, reviews: null });
    expect(data['@type']).toBe(site.schemaType);
    expect(data.telephone).toBe(site.phone.e164);
    expect(data.address).toMatchObject({ addressLocality: site.address.city, addressCountry: site.address.country });
    expect(data.openingHoursSpecification).toHaveLength(site.openingHours.length);
    expect(data).not.toHaveProperty('aggregateRating');
    expect(data).not.toHaveProperty('review');
  });

  it('only includes ratings when real data is supplied', () => {
    const withRating = { ...site, facts: { ...site.facts, rating: { value: 4.9, count: 120, source: 'Google' } } };
    const data = localBusinessJsonLd(withRating, { ...opts, reviews });
    expect(data.aggregateRating).toMatchObject({ ratingValue: 4.9, reviewCount: 120 });
    expect(data.review).toHaveLength(reviews.length);
  });

  it('adds an Offer only when a starting price exists', () => {
    const priced = { ...content.services[0]!, priceFrom: 1200 };
    const data = serviceJsonLd(priced, site, { siteUrl, pageUrl: `${siteUrl}/en/services/${priced.slug}` });
    expect(data.offers).toMatchObject({ priceCurrency: site.currency, price: priced.priceFrom });
    const free = serviceJsonLd({ ...priced, priceFrom: null }, site, { siteUrl, pageUrl: siteUrl });
    expect(free).not.toHaveProperty('offers');
  });

  it('builds FAQPage from visible FAQ content and skips empty lists', () => {
    expect(faqPageJsonLd([])).toBeNull();
    const data = faqPageJsonLd(faqs);
    expect(data?.mainEntity).toHaveLength(faqs.length);
  });

  it('numbers breadcrumb positions from 1', () => {
    const data = breadcrumbJsonLd([
      { name: 'Home', url: `${siteUrl}/en` },
      { name: 'Services', url: `${siteUrl}/en/services` },
    ]);
    expect(data.itemListElement).toMatchObject([{ position: 1 }, { position: 2 }]);
  });

  it('escapes characters that could break out of the script tag', () => {
    const out = serializeJsonLd({ '@context': 'https://schema.org', '@type': 'Thing', name: '</script><b>' });
    expect(out).not.toContain('</script>');
    expect(JSON.parse(out).name).toBe('</script><b>');
  });
});
