import type { PagesConfig } from '../src/lib/config/schema';

/**
 * Section order per page. Reorder, disable, or add entries here; no code change needed.
 * contentRef points to an entry in content/{locale}/sections.ts.
 */
export const pages = {
  home: {
    sections: [
      { key: 'hero', enabled: true, contentRef: 'home-hero' },
      { key: 'showcase', enabled: true, contentRef: 'home-showcase' },
      { key: 'trustStrip', enabled: true, contentRef: 'home-trust' },
      { key: 'servicesGrid', enabled: true, contentRef: 'home-services' },
      { key: 'climate', enabled: true, contentRef: 'home-features' },
      { key: 'whyChooseUs', enabled: true, contentRef: 'home-why' },
      { key: 'climate', enabled: true, contentRef: 'home-technology' },
      { key: 'facility', enabled: true, contentRef: 'home-about' },
      { key: 'contactCta', enabled: true, contentRef: 'home-contact' },
    ],
  },
  services: {
    sections: [
      { key: 'servicesGrid', enabled: true, contentRef: 'home-services' },
      { key: 'climate', enabled: true, contentRef: 'home-technology' },
      { key: 'contactCta', enabled: true, contentRef: 'home-contact' },
    ],
  },
  // Fossil publishes no project gallery or price list; these routes stay reachable but out of the menu.
  gallery: {
    sections: [
      { key: 'facility', enabled: true, contentRef: 'home-about' },
      { key: 'contactCta', enabled: true, contentRef: 'home-contact' },
    ],
  },
  prices: {
    sections: [
      { key: 'servicesGrid', enabled: true, contentRef: 'home-services' },
      { key: 'contactCta', enabled: true, contentRef: 'home-contact' },
    ],
  },
  about: {
    sections: [
      { key: 'climate', enabled: true, contentRef: 'about-story' },
      { key: 'whyChooseUs', enabled: true, contentRef: 'home-why' },
      { key: 'facility', enabled: true, contentRef: 'home-about' },
      { key: 'contactCta', enabled: true, contentRef: 'home-contact' },
    ],
  },
  contact: {
    sections: [{ key: 'contactCta', enabled: true, contentRef: 'contact-form' }],
  },
} satisfies PagesConfig;
