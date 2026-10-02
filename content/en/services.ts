import type { LocaleContentInput } from '../../src/lib/content/schema';

/**
 * Tokens in curly braces are filled from config so facts stay consistent everywhere:
 * {businessName} {city} {priceFrom} {warrantyYears} {turnaround}
 */
export const services: LocaleContentInput['services'] = [
  {
    slug: 'paint-protection-film',
    name: 'Paint Protection Film (PPF)',
    shortDescription: 'Clear, self-healing film that protects paint from stone chips, scratches and UV fade.',
    answer:
      'Paint protection film is a clear, self-healing urethane layer applied over your car paint to stop stone chips, scratches and sun damage. At {businessName} in {city}, PPF starts from {priceFrom}, carries a warranty of up to {warrantyYears}, and takes about {turnaround}.',
    body: [
      'UAE roads mean sand, gravel and highway debris. PPF absorbs these impacts so the paint underneath stays factory-fresh.',
      'Minor swirls and light scratches in the film disappear with heat from the sun or warm water.',
      'We cut every pattern by computer for your exact model, then wrap edges where possible for an invisible finish.',
    ],
    highlights: [
      'Self-healing top coat',
      'Gloss or matte finish',
      'Computer-cut patterns',
      'Removable without paint damage',
    ],
    imageAlt: 'Installer applying clear paint protection film to a car bonnet',
    seo: {
      title: 'Paint Protection Film (PPF) in Dubai',
      description:
        'Self-healing PPF that stops stone chips, scratches and UV fade. Computer-cut, warranty-backed installation.',
    },
  },
  {
    slug: 'ceramic-coating',
    name: 'Ceramic Coating',
    shortDescription: 'A hard, glossy nano-ceramic layer that repels water, dust and bird droppings.',
    answer:
      'Ceramic coating is a liquid nano-ceramic layer that bonds to your paint and hardens into a glossy, water-repelling shield. At {businessName} in {city}, ceramic coating starts from {priceFrom}, with a warranty of up to {warrantyYears}, and takes about {turnaround}.',
    body: [
      'The coating makes dust, sand and bird droppings easier to wash off and reduces the need for harsh cleaning.',
      'We correct the paint before coating so the gloss locks in a flawless finish, not swirl marks.',
    ],
    highlights: ['Deep gloss', 'Hydrophobic finish', 'UV and chemical resistance', 'Easier washing'],
    imageAlt: 'Water beading on a ceramic-coated black car panel',
    seo: {
      title: 'Ceramic Coating in Dubai',
      description: 'Nano-ceramic coating for lasting gloss and easy cleaning, applied after paint correction.',
    },
  },
  {
    slug: 'window-tinting',
    name: 'Window Tinting',
    shortDescription: 'Heat-rejecting nano-ceramic window film within UAE legal tint limits.',
    answer:
      'Window tinting applies a heat-rejecting film to your car glass to keep the cabin cooler, block UV rays and add privacy. At {businessName} in {city}, window tinting starts from {priceFrom}, with a warranty of up to {warrantyYears}, and takes about {turnaround}.',
    body: [
      'Nano-ceramic films reject infrared heat without interfering with phone signal or GPS.',
      'We advise on the legal tint percentage for UAE roads before installation.',
    ],
    highlights: ['Up to 99% UV block', 'Infrared heat rejection', 'No signal interference', 'UAE-compliant shades'],
    imageAlt: 'Technician fitting tint film to a car side window',
    seo: {
      title: 'Car Window Tinting in Dubai',
      description: 'Heat-rejecting nano-ceramic window tint, fitted within UAE legal limits.',
    },
  },
  {
    slug: 'car-wrapping',
    name: 'Car Wrapping',
    shortDescription: 'Full or partial colour change wraps in gloss, satin and matte finishes.',
    answer:
      'Car wrapping covers your factory paint with a removable vinyl film to change its colour or finish. At {businessName} in {city}, full wraps start from {priceFrom}, with a warranty of up to {warrantyYears}, and take about {turnaround}.',
    body: [
      'A wrap protects the original paint and can be removed later, which helps resale value.',
      'Choose from gloss, satin, matte and colour-shift films, or wrap only the roof, mirrors or trim.',
    ],
    highlights: ['Hundreds of colours', 'Protects original paint', 'Fully removable', 'Partial wraps available'],
    imageAlt: 'Car half-wrapped in satin grey vinyl',
    seo: {
      title: 'Car Wrapping in Dubai',
      description: 'Colour change wraps in gloss, satin and matte. Protects and preserves your original paint.',
    },
  },
  {
    slug: 'detailing',
    name: 'Detailing',
    shortDescription: 'Interior and exterior deep cleaning, paint correction and polishing.',
    answer:
      'Detailing is a deep clean and restoration of your car inside and out, including paint correction to remove swirls and light scratches. At {businessName} in {city}, detailing starts from {priceFrom} and takes about {turnaround}.',
    body: [
      'Exterior detailing removes contamination and restores gloss before any protection is applied.',
      'Interior detailing cleans and conditions leather, fabrics and plastics.',
    ],
    highlights: ['Paint correction', 'Interior deep clean', 'Leather conditioning', 'Engine bay cleaning'],
    imageAlt: 'Detailer polishing a car door with a machine polisher',
    seo: {
      title: 'Car Detailing and Paint Correction in Dubai',
      description: 'Interior and exterior detailing with machine paint correction and polishing.',
    },
  },
];
