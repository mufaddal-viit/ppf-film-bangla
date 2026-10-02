import type { LocaleContentInput } from '../../src/lib/content/schema';
import { faqs } from './faqs';
import { sections } from './sections';
import { services } from './services';

/** SAMPLE CONTENT: replace testimonials and portfolio with real data before launch. */
export const content: LocaleContentInput = {
  common: {
    tagline: 'Paint protection, ceramic coating and window tint in Dubai',
    businessDescription:
      'PPF Phantom is a car care studio in Dubai specialising in paint protection film, ceramic coating, window tinting, car wrapping and detailing.',
    whatsappMessage: 'Hi PPF Phantom, I would like a quote for my car.',
  },
  pages: {
    home: {
      title: 'Paint Protection Film and Ceramic Coating in Dubai',
      seo: {
        title: 'PPF, Ceramic Coating and Window Tint in Dubai',
        description:
          'Certified paint protection film, ceramic coating, window tint and wraps in Dubai. Get a free quote today.',
      },
    },
    services: {
      title: 'Car protection services',
      intro: 'Choose the right protection for how and where you drive.',
      seo: {
        title: 'Services',
        description: 'PPF, ceramic coating, window tinting, car wrapping and detailing in Dubai.',
      },
    },
    gallery: {
      title: 'Gallery',
      intro: 'Cars we have protected, wrapped and detailed.',
      seo: { title: 'Gallery', description: 'Photos and videos of our PPF, ceramic coating, tint and wrap projects.' },
    },
    prices: {
      title: 'Prices',
      intro: 'Starting prices for our most popular services.',
      seo: {
        title: 'Prices',
        description: 'Starting prices for PPF, ceramic coating, window tint, wraps and detailing in Dubai.',
      },
    },
    about: {
      title: 'About PPF Phantom',
      intro: 'A Dubai studio dedicated to protecting and perfecting cars.',
      seo: { title: 'About us', description: 'Meet the certified team and studio behind PPF Phantom in Dubai.' },
    },
    contact: {
      title: 'Contact us',
      intro: 'Call, WhatsApp or send the form. We usually reply within one working hour.',
      seo: { title: 'Contact', description: 'Call, WhatsApp or request a quote from PPF Phantom in Dubai.' },
      whatsappMessage: 'Hi PPF Phantom, I have a question.',
    },
    blog: {
      title: 'Blog',
      intro: 'Guides and advice on protecting your car in the UAE.',
      seo: { title: 'Blog', description: 'Car care guides for UAE drivers: PPF, ceramic coating, tinting and more.' },
    },
    privacyPolicy: {
      title: 'Privacy policy',
      seo: { title: 'Privacy policy', description: 'How PPF Phantom collects, uses and protects your personal data.' },
    },
    terms: {
      title: 'Terms and conditions',
      seo: { title: 'Terms and conditions', description: 'Terms that apply to services provided by PPF Phantom.' },
    },
    notFound: {
      title: 'Page not found',
      intro: 'The page you are looking for does not exist or has moved.',
      seo: { title: 'Page not found', description: 'The page you are looking for does not exist.' },
    },
  },
  services,
  packages: [
    {
      id: 'front-protection',
      name: 'Front protection',
      description: 'PPF on the areas hit most by stones.',
      includes: ['Full bonnet', 'Front bumper', 'Front fenders', 'Mirrors'],
    },
    {
      id: 'full-body-ppf',
      name: 'Full body PPF',
      description: 'Every painted panel covered for complete protection.',
      includes: ['All painted panels', 'Door edges and cups', 'Paint correction', 'Ceramic top coat'],
    },
    {
      id: 'ceramic-pro',
      name: 'Ceramic pro',
      description: 'Multi-layer ceramic coating with paint correction.',
      includes: ['Two-stage paint correction', 'Body ceramic coating', 'Wheel and glass coating'],
    },
  ],
  faqs,
  testimonials: [
    {
      id: 'sample-1',
      author: 'Sample customer',
      rating: 5,
      text: 'SAMPLE REVIEW. Replace with a real customer review before launch.',
      date: '2026-09-01',
      source: 'Google',
      vehicle: 'Sample vehicle',
    },
    {
      id: 'sample-2',
      author: 'Sample customer',
      rating: 5,
      text: 'SAMPLE REVIEW. Replace with a real customer review before launch.',
      date: '2026-08-15',
      source: 'Google',
    },
  ],
  portfolio: [
    {
      id: 'project-1',
      title: 'Full body PPF',
      serviceSlug: 'paint-protection-film',
      vehicle: 'Sports coupe',
      image: { src: '/images/portfolio/1.jpg', alt: 'Sports coupe after full body PPF', width: 1200, height: 800 },
    },
    {
      id: 'project-2',
      title: 'Ceramic coating',
      serviceSlug: 'ceramic-coating',
      vehicle: 'Luxury SUV',
      image: { src: '/images/portfolio/2.jpg', alt: 'SUV with a fresh ceramic coating', width: 1200, height: 800 },
    },
    {
      id: 'project-3',
      title: 'Satin grey wrap',
      serviceSlug: 'car-wrapping',
      vehicle: 'Sedan',
      image: { src: '/images/portfolio/3.jpg', alt: 'Sedan wrapped in satin grey', width: 1200, height: 800 },
    },
    {
      id: 'project-4',
      title: 'Nano-ceramic tint',
      serviceSlug: 'window-tinting',
      vehicle: 'Pickup',
      image: { src: '/images/portfolio/4.jpg', alt: 'Pickup with tinted windows', width: 1200, height: 800 },
    },
    {
      id: 'project-5',
      title: 'Front protection',
      serviceSlug: 'paint-protection-film',
      vehicle: 'Hatchback',
      image: { src: '/images/portfolio/5.jpg', alt: 'Hatchback with front PPF', width: 1200, height: 800 },
    },
    {
      id: 'project-6',
      title: 'Paint correction',
      serviceSlug: 'detailing',
      vehicle: 'Classic car',
      image: { src: '/images/portfolio/6.jpg', alt: 'Classic car after paint correction', width: 1200, height: 800 },
    },
  ],
  sections,
};
