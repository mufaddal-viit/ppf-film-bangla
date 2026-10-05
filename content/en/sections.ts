import type { LocaleContentInput } from '../../src/lib/content/schema';

/** Section copy, keyed by the contentRef used in config/pages.ts. Wording follows getfossil.com. */
export const sections: LocaleContentInput['sections'] = {
  'home-hero': {
    key: 'hero',
    eyebrow: 'Fossil Paint Protection Film · USA',
    wordmark: 'FOSSIL',
    heading: 'Unmistakably strong, exceptionally clear',
    headingHighlight: 'exceptionally clear',
    subheading: 'Reliable paint protection without altering the character of your vehicle',
    stats: [
      { icon: 'shield-check', value: '{warrantyYearsMaxNumber} yr', label: 'Max warranty' },
      { icon: 'shield', value: '7.5 mil', label: 'Film thickness' },
      { icon: 'sparkles', value: '99 GU', label: 'Gloss (Apex)' },
      { icon: 'sun', value: '99%', label: 'UV rejection' },
      { icon: 'badge-check', value: '∆E < 1', label: 'Anti-yellowing' },
    ],
    primaryCta: { action: 'route', label: 'Discover Fossil PPF', href: '/services' },
    secondaryCta: { action: 'route', label: 'Contact us', href: '/contact' },
    media: {
      type: 'image',
      image: {
        src: '/images/hero/car.webp',
        alt: 'White sports coupe protected with clear paint protection film, side view',
        width: 2049,
        height: 606,
      },
    },
    serviceChips: [],
  },
  'home-trust': {
    key: 'trustStrip',
    heading: 'Built to withstand real-world abuse',
    intro:
      'Every drive introduces wear — from impact, debris, contaminants, and constant environmental exposure. Fossil PPF acts as a high-strength defensive layer that absorbs surface stress before it reaches your paint.',
    stats: [
      { label: 'Year maximum warranty', value: { fact: 'warrantyYearsMax' } },
      { label: 'Years of industry experience', value: { number: 20 }, suffix: '+' },
      { label: 'Film lines', value: { number: 7 } },
      { label: 'UV rejection, window film', value: { number: 99 }, suffix: '%' },
    ],
  },
  'home-services': {
    key: 'servicesGrid',
    heading: 'Fossil car protection products',
    intro: 'Time changes everything — except what is protected.',
    serviceSlugs: [],
  },
  'home-features': {
    key: 'climate',
    heading: 'Fossil paint protection film',
    intro:
      'With a balance of toughness and refinement, Fossil paint protection film preserves what makes your vehicle unique — today and for years to come.',
    points: [
      {
        icon: 'sparkles',
        title: 'Outstanding clarity',
        body: 'Unparalleled transparency that preserves the original paint finish without distortion, enhancing gloss and maintaining the vehicle’s factory appearance.',
      },
      {
        icon: 'spray-can',
        title: 'Stain resistance',
        body: 'Protects against water spots, bug splatter, road grime, and light chemical stains for easier maintenance.',
      },
      {
        icon: 'shield-check',
        title: 'Self-healing surface',
        body: 'Minor scratches and swirl marks disappear with exposure to heat, keeping the surface smooth and clean.',
      },
      {
        icon: 'badge-check',
        title: 'Reliable adhesion',
        body: 'Designed for consistent bonding with painted surfaces, ensuring stable performance and clean removal when required.',
      },
    ],
  },
  'home-why': {
    key: 'whyChooseUs',
    heading: 'Why Fossil',
    points: [
      {
        icon: 'clock',
        title: 'Built on experience',
        body: 'Backed by decades of industry leadership and real-world market development.',
      },
      {
        icon: 'shield',
        title: 'Engineered for longevity',
        body: 'Designed to combat aging, discoloration, staining, and gloss loss.',
      },
      {
        icon: 'star',
        title: 'Premium performance',
        body: 'High clarity, durable protection, and long-term visual excellence.',
      },
      {
        icon: 'badge-check',
        title: 'Trusted by professionals',
        body: 'Developed with installers in mind and vehicle owners at heart.',
      },
    ],
  },
  'home-technology': {
    key: 'climate',
    heading: 'Advanced technology',
    intro:
      'This is protection that works quietly in the background, supporting long-term finish preservation without constant upkeep.',
    points: [
      {
        icon: 'wind',
        title: 'Hydrophobic coating',
        body: 'A nanoscale hydrophobic top layer repels water, dirt, and contaminants by increasing surface contact angle, resulting in easier cleaning and reduced water spotting.',
      },
      {
        icon: 'shield-check',
        title: 'Adhesive technology',
        body: 'Engineered acrylic adhesive ensures uniform bonding without residue, reducing installation errors and edge lifting.',
      },
      {
        icon: 'sun',
        title: 'Anti-yellowing',
        body: 'UV stabilizers and anti-oxidation additives prevent discoloration, maintaining clarity throughout the product’s lifespan.',
      },
    ],
  },
  'home-about': {
    key: 'facility',
    heading: 'Our promise',
    intro:
      'At FOSSIL, we are committed to delivering paint protection and window film solutions that preserve value, enhance appearance, and exceed expectations. Every product we create reflects our dedication to quality, innovation, and the enduring protection of what matters most.',
    photos: [
      {
        src: '/images/facility/1.jpg',
        alt: 'Black and red Chevrolet Corvette seen from above',
        width: 1600,
        height: 1067,
      },
      {
        src: '/images/facility/2.jpg',
        alt: 'Red hypercar under the words Engineered to preserve',
        width: 1200,
        height: 800,
      },
      {
        src: '/images/facility/3.jpg',
        alt: 'SUV with paint protection film panel outlines traced over the bodywork',
        width: 1200,
        height: 800,
      },
    ],
    stats: [],
  },
  'about-story': {
    key: 'climate',
    heading: 'About Fossil',
    intro:
      'A USA-based paint protection and window film brand headquartered in Abilene, Texas, engineered to redefine industry standards.',
    points: [
      {
        icon: 'clock',
        title: 'Story',
        body: 'With over two decades of experience helping establish and grow markets for some of the most respected names in the industry — Solar Gard, Eastman, and 3M — our leadership has played a pivotal role in shaping the evolution of paint protection and window film solutions worldwide. Drawing from this extensive background, our management set out to create a brand that reflects uncompromising quality, innovation, and long-term performance.',
      },
      {
        icon: 'shield',
        title: 'Inspired by preservation',
        body: 'Fossils endure for centuries by protecting what lies beneath the surface — capturing history in its purest form. In the same way, FOSSIL Paint Protection Film is designed to preserve a vehicle’s original paint, shielding it from environmental damage, road debris, and everyday wear. Our name represents longevity, strength, and the commitment to maintaining a vehicle’s factory finish exactly as intended.',
      },
      {
        icon: 'sparkles',
        title: 'Engineered to last',
        body: 'Traditional PPF solutions often suffer from aging, staining, yellowing, and loss of gloss — issues that diminish both appearance and value over time. Through advanced material science, precision manufacturing, and rigorous quality control, FOSSIL films are engineered to resist degradation, maintain optical clarity, and deliver long-lasting gloss. The result is a protection solution that performs consistently, installs confidently, and stands the test of time.',
      },
    ],
  },
  'home-contact': {
    key: 'contactCta',
    heading: 'We’d love to hear from you',
    intro: 'Send us a message and the Fossil team will get back to you.',
    formVariant: 'contact',
    showMap: true,
  },
  'contact-form': {
    key: 'contactCta',
    heading: 'Send us a message',
    intro: 'Stay connected: call, email or use the form.',
    formVariant: 'contact',
    showMap: true,
  },
};
