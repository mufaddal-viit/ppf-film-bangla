import type { Catalog } from '../src/lib/config/schema';

/**
 * Numbers that must be identical in every language: prices, warranties, turnaround.
 * Text for each service lives in content/{locale}/services.ts under the same slug.
 * PLACEHOLDER PRICES: replace before launch.
 */
export const catalog = {
  services: [
    {
      slug: 'paint-protection-film',
      icon: 'shield',
      priceFrom: 4500,
      warrantyYears: 10,
      turnaround: { value: 3, unit: 'days' },
      image: { src: '/images/services/paint-protection-film.jpg', width: 1200, height: 800 },
    },
    {
      slug: 'ceramic-coating',
      icon: 'sparkles',
      priceFrom: 1500,
      warrantyYears: 5,
      turnaround: { value: 2, unit: 'days' },
      image: { src: '/images/services/ceramic-coating.jpg', width: 1200, height: 800 },
    },
    {
      slug: 'window-tinting',
      icon: 'sun',
      priceFrom: 800,
      warrantyYears: 5,
      turnaround: { value: 4, unit: 'hours' },
      image: { src: '/images/services/window-tinting.jpg', width: 1200, height: 800 },
    },
    {
      slug: 'car-wrapping',
      icon: 'palette',
      priceFrom: 6000,
      warrantyYears: 3,
      turnaround: { value: 4, unit: 'days' },
      image: { src: '/images/services/car-wrapping.jpg', width: 1200, height: 800 },
    },
    {
      slug: 'detailing',
      icon: 'spray-can',
      priceFrom: 500,
      warrantyYears: null,
      turnaround: { value: 6, unit: 'hours' },
      image: { src: '/images/services/detailing.jpg', width: 1200, height: 800 },
    },
  ],
  packages: [
    { id: 'front-protection', serviceSlug: 'paint-protection-film', priceFrom: 4500, highlighted: false },
    { id: 'full-body-ppf', serviceSlug: 'paint-protection-film', priceFrom: 12000, highlighted: true },
    { id: 'ceramic-pro', serviceSlug: 'ceramic-coating', priceFrom: 2500, highlighted: false },
  ],
} satisfies Catalog;
