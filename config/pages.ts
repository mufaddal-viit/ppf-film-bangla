import type { PagesConfig } from '../src/lib/config/schema';

/**
 * Section order per page. Reorder, disable, or add entries here; no code change needed.
 * contentRef points to an entry in content/{locale}/sections.ts.
 */
export const pages = {
  home: {
    sections: [
      { key: 'hero', enabled: true, contentRef: 'home-hero' },
      { key: 'trustStrip', enabled: true, contentRef: 'home-trust' },
      { key: 'servicesGrid', enabled: true, contentRef: 'home-services' },
      { key: 'climate', enabled: true, contentRef: 'home-climate' },
      { key: 'whyChooseUs', enabled: true, contentRef: 'home-why' },
      { key: 'packages', enabled: true, contentRef: 'home-packages' },
      { key: 'portfolio', enabled: true, contentRef: 'home-portfolio' },
      { key: 'facility', enabled: true, contentRef: 'home-facility' },
      { key: 'process', enabled: true, contentRef: 'home-process' },
      { key: 'reviews', enabled: true, contentRef: 'home-reviews' },
      { key: 'faq', enabled: true, contentRef: 'home-faq' },
      { key: 'contactCta', enabled: true, contentRef: 'home-contact' },
    ],
  },
  services: {
    sections: [
      { key: 'servicesGrid', enabled: true, contentRef: 'home-services' },
      { key: 'process', enabled: true, contentRef: 'home-process' },
      { key: 'contactCta', enabled: true, contentRef: 'home-contact' },
    ],
  },
  gallery: {
    sections: [
      { key: 'portfolio', enabled: true, contentRef: 'home-portfolio' },
      { key: 'contactCta', enabled: true, contentRef: 'home-contact' },
    ],
  },
  prices: {
    sections: [
      { key: 'packages', enabled: true, contentRef: 'home-packages' },
      { key: 'faq', enabled: true, contentRef: 'home-faq' },
      { key: 'contactCta', enabled: true, contentRef: 'home-contact' },
    ],
  },
  about: {
    sections: [
      { key: 'whyChooseUs', enabled: true, contentRef: 'home-why' },
      { key: 'facility', enabled: true, contentRef: 'home-facility' },
      { key: 'process', enabled: true, contentRef: 'home-process' },
      { key: 'reviews', enabled: true, contentRef: 'home-reviews' },
    ],
  },
  contact: {
    sections: [
      { key: 'contactCta', enabled: true, contentRef: 'contact-form' },
      { key: 'faq', enabled: true, contentRef: 'home-faq' },
    ],
  },
} satisfies PagesConfig;
