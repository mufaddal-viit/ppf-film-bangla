import type { SiteConfig } from '../src/lib/config/schema';

/** Business identity and NAP (name, address, phone). DUMMY VALUES: replace before launch. */
export const site = {
  business: {
    name: 'PPF Phantom',
    legalName: 'PPF Phantom Car Care L.L.C.',
    schemaType: 'AutoBodyShop',
    logo: { src: '/brand/logo.svg', width: 160, height: 40 },
    priceRange: 'AED 500 - AED 15,000',
    foundingYear: 2020,
  },
  locale: {
    locales: ['en', 'ar'],
    defaultLocale: 'en',
    rtlLocales: ['ar'],
    currency: 'AED',
    timezone: 'Asia/Dubai',
    phoneRegion: 'AE',
  },
  contact: {
    phone: '+97142000000',
    whatsapp: '+971500000000',
    email: 'hello@example.com',
    address: {
      street: 'Warehouse 00, Street 00',
      area: 'Al Quoz Industrial Area 3',
      city: 'Dubai',
      emirate: 'Dubai',
      country: 'AE',
    },
    geo: { lat: 25.135, lng: 55.225 },
    mapUrl: 'https://maps.google.com/?q=25.135,55.225',
    mapEmbedUrl: 'https://www.google.com/maps?q=25.135,55.225&output=embed',
    areaServed: ['Dubai', 'Sharjah', 'Abu Dhabi'],
  },
  hours: [
    {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Saturday', 'Sunday'],
      opens: '09:00',
      closes: '20:00',
    },
    { days: ['Friday'], opens: '14:00', closes: '20:00' },
  ],
  social: [
    { platform: 'instagram', url: 'https://www.instagram.com/example' },
    { platform: 'tiktok', url: 'https://www.tiktok.com/@example' },
    { platform: 'youtube', url: 'https://www.youtube.com/@example' },
  ],
  paymentMethods: ['cash', 'visa', 'mastercard', 'applePay', 'tabby'],
  facts: {
    warrantyYearsMax: 10,
    jobsCompleted: 2500,
    rating: null,
  },
} satisfies SiteConfig;
