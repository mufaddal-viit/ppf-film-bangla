import type { LocaleContentInput } from '../../src/lib/content/schema';

/** Section copy, keyed by the contentRef used in config/pages.ts. */
export const sections: LocaleContentInput['sections'] = {
  'home-hero': {
    key: 'hero',
    eyebrow: 'Car care studio in Dubai',
    heading: 'Protect your paint from the UAE sun, sand and road',
    subheading: 'Paint protection film, ceramic coating, window tint and wraps, installed by certified technicians.',
    primaryCta: { action: 'route', label: 'Get a free quote', href: '/contact' },
    secondaryCta: { action: 'whatsapp', label: 'Chat on WhatsApp' },
    media: {
      type: 'image',
      image: {
        src: '/images/hero.jpg',
        alt: 'Black sports car with a gloss paint protection film finish',
        width: 1920,
        height: 1080,
      },
    },
    serviceChips: ['paint-protection-film', 'ceramic-coating', 'window-tinting', 'car-wrapping'],
  },
  'home-trust': {
    key: 'trustStrip',
    heading: 'Why drivers trust us',
    ratingLabel: 'Average rating',
    warrantyLabel: 'Years warranty',
    jobsLabel: 'Cars protected',
    partnersLabel: 'Certified installer for',
    partners: [{ name: 'Partner Brand A' }, { name: 'Partner Brand B' }, { name: 'Partner Brand C' }],
  },
  'home-services': {
    key: 'servicesGrid',
    heading: 'Our services',
    intro: 'Everything your car needs to look new and stay protected.',
    serviceSlugs: [],
  },
  'home-climate': {
    key: 'climate',
    heading: 'Built for UAE conditions',
    intro: 'Desert heat, sand and long highway drives are hard on paint, glass and interiors.',
    points: [
      {
        icon: 'sun',
        title: 'Extreme UV and heat',
        body: 'Summer temperatures fade paint and crack interiors without protection.',
      },
      { icon: 'wind', title: 'Sand and dust', body: 'Wind-blown sand acts like sandpaper on clear coat and glass.' },
      {
        icon: 'road',
        title: 'Highway debris',
        body: 'High-speed driving on E11 and E311 throws stones at your bonnet and bumper.',
      },
    ],
  },
  'home-why': {
    key: 'whyChooseUs',
    heading: 'Why choose PPF Phantom',
    points: [
      {
        icon: 'badge-check',
        title: 'Certified installers',
        body: 'Every technician is trained and certified by the film manufacturer.',
        proof: 'Manufacturer certification',
      },
      {
        icon: 'shield-check',
        title: 'Written warranty',
        body: 'Your film and workmanship are covered by a registered warranty.',
      },
      {
        icon: 'warehouse',
        title: 'Dust-controlled bays',
        body: 'Clean, climate-controlled installation bays for a flawless finish.',
      },
    ],
  },
  'home-packages': {
    key: 'packages',
    heading: 'Popular packages',
    intro: 'Starting prices. Your exact quote depends on vehicle size and condition.',
    packageIds: [],
    cta: { action: 'route', label: 'Request exact price', href: '/contact' },
  },
  'home-portfolio': {
    key: 'portfolio',
    heading: 'Recent work',
    intro: 'A selection of cars we have protected and transformed.',
    showFilters: true,
    reels: [],
  },
  'home-facility': {
    key: 'facility',
    heading: 'Our studio',
    intro: 'A dedicated, climate-controlled facility built for film and coating work.',
    photos: [
      {
        src: '/images/facility/1.jpg',
        alt: 'Installation bay with a car under bright inspection lights',
        width: 1200,
        height: 800,
      },
      { src: '/images/facility/2.jpg', alt: 'Customer lounge at the studio', width: 1200, height: 800 },
      { src: '/images/facility/3.jpg', alt: 'Film plotter cutting a PPF pattern', width: 1200, height: 800 },
    ],
    stats: [
      { label: 'Cars protected', value: { fact: 'jobsCompleted' }, suffix: '+' },
      { label: 'Years warranty', value: { fact: 'warrantyYearsMax' } },
      { label: 'Installation bays', value: { number: 6 } },
    ],
  },
  'home-process': {
    key: 'process',
    heading: 'How it works',
    steps: [
      { title: 'Consultation', body: 'Tell us about your car and how you drive. We recommend the right protection.' },
      { title: 'Preparation', body: 'We wash, decontaminate and correct the paint before any film or coating.' },
      { title: 'Installation', body: 'Certified technicians install in a dust-controlled bay.' },
      { title: 'Inspection and handover', body: 'We inspect under studio lights and register your warranty.' },
    ],
  },
  'home-reviews': {
    key: 'reviews',
    heading: 'What customers say',
  },
  'home-faq': {
    key: 'faq',
    heading: 'Frequently asked questions',
    faqIds: [],
  },
  'home-contact': {
    key: 'contactCta',
    heading: 'Get your free quote',
    intro: 'Send your car details and we will reply with a price, usually within one working hour.',
    formVariant: 'quote',
    showMap: true,
  },
  'contact-form': {
    key: 'contactCta',
    heading: 'Send us a message',
    intro: 'Questions, bookings or quotes: we reply within one working hour.',
    formVariant: 'contact',
    showMap: true,
  },
};
