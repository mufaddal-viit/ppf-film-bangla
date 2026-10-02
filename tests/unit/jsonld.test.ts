import { describe, expect, it } from 'vitest';
import { getContent, getSite } from '@/lib/content';
import { breadcrumbJsonLd, faqPageJsonLd, localBusinessJsonLd, serializeJsonLd, serviceJsonLd } from '@/lib/seo/jsonld';

const siteUrl = 'https://www.example.ae';

describe('JSON-LD helpers', async () => {
  const site = await getSite('en');
  const content = await getContent('en');
  const opts = { siteUrl, pageUrl: `${siteUrl}/en`, image: `${siteUrl}/og.jpg`, logo: `${siteUrl}/logo.svg` };

  it('builds LocalBusiness from config with consistent NAP and hours', () => {
    const data = localBusinessJsonLd(site, { ...opts, reviews: null });
    expect(data['@type']).toBe(site.schemaType);
    expect(data.telephone).toBe(site.phone.e164);
    expect(data.address).toMatchObject({ addressLocality: site.address.city, addressCountry: 'AE' });
    expect(data.openingHoursSpecification).toHaveLength(site.openingHours.length);
    expect(data).not.toHaveProperty('aggregateRating');
    expect(data).not.toHaveProperty('review');
  });

  it('only includes ratings when real data is supplied', () => {
    const withRating = { ...site, facts: { ...site.facts, rating: { value: 4.9, count: 120, source: 'Google' } } };
    const data = localBusinessJsonLd(withRating, { ...opts, reviews: content.testimonials });
    expect(data.aggregateRating).toMatchObject({ ratingValue: 4.9, reviewCount: 120 });
    expect(data.review).toHaveLength(content.testimonials.length);
  });

  it('adds an Offer only when a starting price exists', () => {
    const priced = content.services.find((s) => s.priceFrom !== null)!;
    const data = serviceJsonLd(priced, site, { siteUrl, pageUrl: `${siteUrl}/en/services/${priced.slug}` });
    expect(data.offers).toMatchObject({ priceCurrency: 'AED', price: priced.priceFrom });
    const free = serviceJsonLd({ ...priced, priceFrom: null }, site, { siteUrl, pageUrl: siteUrl });
    expect(free).not.toHaveProperty('offers');
  });

  it('builds FAQPage from visible FAQ content and skips empty lists', () => {
    expect(faqPageJsonLd([])).toBeNull();
    const data = faqPageJsonLd(content.faqs);
    expect(data?.mainEntity).toHaveLength(content.faqs.length);
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
