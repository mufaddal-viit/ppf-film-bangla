import type { SiteConfig } from '../src/lib/config/schema';

/** Business identity: the Phantom PPF brand, with the address and phone taken from getfossil.com. */
export const site = {
  business: {
    name: 'Phantom PPF',
    shortName: 'Phantom',
    legalName: 'Phantom PPF',
    schemaType: 'AutomotiveBusiness',
    logo: { src: '/brand/logo-phantom.png', width: 141, height: 44 },
    priceRange: '$$',
  },
  locale: {
    locales: ['en', 'ar'],
    defaultLocale: 'en',
    rtlLocales: ['ar'],
    currency: 'USD',
    timezone: 'America/Chicago',
    phoneRegion: 'US',
  },
  contact: {
    phone: '+15752551211',
    // Fossil lists no WhatsApp number; WhatsApp links are switched off in config/integrations.ts.
    whatsapp: '+15752551211',
    email: 'info@getfossil.com',
    address: {
      street: '2438 Industrial Blvd',
      area: '#604',
      city: 'Abilene',
      emirate: 'TX',
      country: 'US',
    },
    // Abilene city centre: the site gives a street address but no coordinates.
    geo: { lat: 32.4487, lng: -99.7331 },
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=2438+Industrial+Blvd+%23604%2C+Abilene%2C+TX',
    mapEmbedUrl: 'https://www.google.com/maps?q=2438+Industrial+Blvd+%23604%2C+Abilene%2C+TX&output=embed',
    areaServed: ['United States'],
  },
  // Opening hours are not published on getfossil.com.
  hours: [],
  social: [],
  paymentMethods: [],
  facts: {
    warrantyYearsMax: 10,
    jobsCompleted: 0,
    rating: null,
  },
} satisfies SiteConfig;
