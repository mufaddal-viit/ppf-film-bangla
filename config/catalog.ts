import type { Catalog } from '../src/lib/config/schema';

/**
 * Numbers that must be identical in every language: warranties (prices and turnaround are not
 * published by Fossil, so they stay null). Each entry is a Fossil film line; the route segment is
 * still /services/{slug}. Text lives in content/{locale}/services.ts under the same slug.
 */
const image = (slug: string) => ({ src: `/images/services/${slug}.jpg`, width: 960, height: 640 });

export const catalog = {
  services: [
    { slug: 'apex', icon: 'shield-check', priceFrom: null, warrantyYears: 10, turnaround: null, image: image('apex') },
    {
      slug: 'sapphire',
      icon: 'sparkles',
      priceFrom: null,
      warrantyYears: 8,
      turnaround: null,
      image: image('sapphire'),
    },
    { slug: 'opal', icon: 'shield', priceFrom: null, warrantyYears: 5, turnaround: null, image: image('opal') },
    { slug: 'stealth', icon: 'palette', priceFrom: null, warrantyYears: 10, turnaround: null, image: image('stealth') },
    { slug: 'frozen', icon: 'wind', priceFrom: null, warrantyYears: 10, turnaround: null, image: image('frozen') },
    { slug: 'solaris', icon: 'sun', priceFrom: null, warrantyYears: 10, turnaround: null, image: image('solaris') },
    { slug: 'luminox', icon: 'star', priceFrom: null, warrantyYears: 10, turnaround: null, image: image('luminox') },
  ],
  packages: [],
} satisfies Catalog;
