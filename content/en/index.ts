import type { LocaleContentInput } from '../../src/lib/content/schema';
import { faqs } from './faqs';
import { sections } from './sections';
import { services } from './services';

/** Copy follows getfossil.com, which publishes no packages, testimonials, project gallery or FAQs. */
export const content: LocaleContentInput = {
  common: {
    tagline: 'Unmistakably strong. Exceptionally clear.',
    businessDescription:
      'Fossil is a USA-based paint protection and window film brand headquartered in Abilene, Texas. Fossil PPF is developed to deliver reliable paint protection with exceptional clarity, strength, and long-term performance.',
    whatsappMessage: 'Hello Fossil, I would like to know more about your films.',
  },
  pages: {
    home: {
      title: 'Fossil Paint Protection Film',
      seo: {
        title: 'Fossil Paint Protection Film and Window Film',
        description:
          'Fossil PPF delivers reliable paint protection with exceptional clarity, strength and long-term performance.',
      },
    },
    services: {
      title: 'Our products',
      intro:
        'Clear, satin and matte paint protection film, plus ceramic window film. Durable, self-healing protection that keeps your car looking brand new.',
      seo: {
        title: 'Products',
        description:
          'Fossil clear PPF (Apex, Sapphire, Opal), Stealth satin, Frozen matte, and Solaris and Luminox ceramic window film.',
      },
    },
    gallery: {
      title: 'Engineered to preserve',
      intro: 'Paint protection film that preserves what makes your vehicle unique.',
      seo: {
        title: 'Engineered to preserve',
        description: 'Fossil paint protection film and window film in pictures.',
      },
    },
    prices: {
      title: 'Our products',
      intro: 'Contact us or your local installer for pricing on any Fossil film.',
      seo: {
        title: 'Product range',
        description: 'The Fossil paint protection film and ceramic window film range. Contact us for pricing.',
      },
    },
    about: {
      title: 'About Fossil',
      intro:
        'That vision led to the birth of FOSSIL, a USA-based paint protection and window film brand headquartered in Abilene, Texas, engineered to redefine industry standards.',
      seo: {
        title: 'About us',
        description:
          'Fossil is a USA-based paint protection and window film brand from Abilene, Texas, built on over two decades of industry experience.',
      },
    },
    contact: {
      title: 'Contact us',
      intro: 'We’d love to hear from you.',
      seo: { title: 'Contact', description: 'Call, email or send a message to Fossil in Abilene, Texas.' },
    },
    blog: {
      title: 'Blog',
      intro: 'Plain guides on paint protection film, window film and looking after your car.',
      seo: {
        title: 'Blog: paint protection film and car care guides',
        description:
          'Guides on paint protection film, window film and car care: what each film does and how to choose.',
      },
    },
    privacyPolicy: {
      title: 'Privacy policy',
      seo: { title: 'Privacy policy', description: 'How Fossil collects, uses and protects your personal data.' },
    },
    terms: {
      title: 'Terms and conditions',
      seo: { title: 'Terms and conditions', description: 'Terms that apply to this website.' },
    },
    notFound: {
      title: 'Page not found',
      intro: 'The page you are looking for does not exist or has moved.',
      seo: { title: 'Page not found', description: 'The page you are looking for does not exist.' },
    },
  },
  services,
  packages: [],
  faqs,
  testimonials: [],
  portfolio: [],
  sections,
};
