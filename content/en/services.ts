import type { LocaleContentInput } from '../../src/lib/content/schema';

/**
 * Fossil film lines, with copy and specifications taken from getfossil.com.
 * Tokens in curly braces are filled from config so facts stay consistent everywhere:
 * {businessName} {warrantyYears}
 */
const PPF_FEATURES = [
  'Outstanding clarity that preserves the original paint finish without distortion',
  'Stain resistance against water spots, bug splatter, road grime and light chemical stains',
  'Self-healing surface: minor scratches and swirl marks disappear with exposure to heat',
  'Reliable adhesion for stable performance and clean removal when required',
  'Nanoscale hydrophobic top layer for easier cleaning and reduced water spotting',
  'Engineered acrylic adhesive that bonds uniformly without residue',
  'UV stabilizers and anti-oxidation additives that prevent discoloration',
];

const WINDOW_FILM_SPECS = [
  'Technology: ceramic',
  'Clarity: ultra-clear',
  'IR substrate: USA',
  'Adhesive: Germany',
  'Haze: < 1',
  'UV rejection (UVR): 99% on every shade',
  'Infrared rejection (IRR): 96% to 99% depending on shade',
  'Total solar energy rejected (TSER): 58% to 95% depending on shade',
];

export const services: LocaleContentInput['services'] = [
  {
    slug: 'apex',
    name: 'Apex Clear PPF',
    shortDescription: 'Ultimate protection. Flawless finish. Long-term confidence.',
    answer:
      'Apex Clear PPF represents the pinnacle of paint protection technology. Designed for luxury, performance, and high-value vehicles, Apex delivers unmatched clarity, durability, and long-term performance, and carries a {warrantyYears} warranty.',
    body: [
      'Manufactured with next-generation TPU and an advanced elastomeric top coat, Apex offers superior self-healing, enhanced impact resistance, and industry-leading optical clarity.',
      'Its ultra-stable formulation resists yellowing, cracking, and delamination even under extreme environmental conditions.',
    ],
    highlights: [
      'Thickness: 7.5 mil',
      'Gloss: 99 GU',
      'Coating elongation: 130%',
      'Anti-yellowing: 92% (∆E < 1)',
      ...PPF_FEATURES,
    ],
    imageAlt: 'Dark sports car protected with Fossil Apex clear paint protection film',
    seo: {
      title: 'Apex Clear PPF',
      description:
        'Apex is the flagship Fossil clear paint protection film: 7.5 mil, 99 GU gloss, self-healing top coat and a 10 year warranty.',
    },
  },
  {
    slug: 'sapphire',
    name: 'Sapphire Clear PPF',
    shortDescription: 'Premium protection with exceptional value.',
    answer:
      'Sapphire Clear PPF is designed for customers who want premium-level protection without stepping into the flagship category. It delivers excellent clarity, durability, and self-healing performance, and carries an {warrantyYears} warranty.',
    body: [
      'Sapphire is a strong choice for modern vehicles and long-term daily use.',
      'It balances performance and affordability, offering enhanced scratch resistance, strong hydrophobic properties, and long-lasting optical stability.',
    ],
    highlights: [
      'Thickness: 7.5 mil',
      'Gloss: 96 GU',
      'Coating elongation: 130%',
      'Anti-yellowing: 92% (∆E < 1)',
      ...PPF_FEATURES,
    ],
    imageAlt: 'Red sports car protected with Fossil Sapphire clear paint protection film',
    seo: {
      title: 'Sapphire Clear PPF',
      description:
        'Sapphire is a Fossil clear paint protection film with premium clarity, self-healing performance and an 8 year warranty.',
    },
  },
  {
    slug: 'opal',
    name: 'Opal Clear PPF',
    shortDescription: 'Crystal-clear protection for everyday driving.',
    answer:
      'Opal Clear Paint Protection Film offers a dependable balance of protection, clarity, and value. Built using high-quality thermoplastic polyurethane (TPU), Opal provides a high-gloss, optically clear finish that blends seamlessly with OEM paint, and carries a {warrantyYears} warranty.',
    body: [
      'The film features self-healing technology to minimize fine scratches and swirl marks, helping maintain a fresh appearance over time.',
      'With strong UV resistance and anti-yellowing properties, Opal ensures consistent clarity throughout its service life, making it an ideal solution for customers seeking affordable yet professional-grade protection.',
    ],
    highlights: [
      'Thickness: 7.5 mil',
      'Gloss: 96 GU',
      'Coating elongation: 110%',
      'Anti-yellowing: 92% (∆E < 1)',
      ...PPF_FEATURES,
    ],
    imageAlt: 'Black coupe protected with Fossil Opal clear paint protection film',
    seo: {
      title: 'Opal Clear PPF',
      description:
        'Opal is a Fossil clear paint protection film for everyday driving: high-gloss TPU, self-healing and a 5 year warranty.',
    },
  },
  {
    slug: 'stealth',
    name: 'Stealth Clear Satin PPF',
    shortDescription: 'Refined protection with a factory satin finish.',
    answer:
      'Stealth Paint Protection Film is engineered to transform glossy factory paint into a smooth, refined satin finish while delivering full paint protection performance. It carries a {warrantyYears} warranty.',
    body: [
      'Designed for customers who want a subtle, OEM-style aesthetic without compromising durability, Satin PPF provides a soft sheen that enhances body lines and contours.',
      'Manufactured using premium TPU and advanced surface technology, Satin PPF offers self-healing capabilities, strong UV resistance, and excellent stain protection. It preserves the original paint underneath while offering a distinctive, understated look.',
    ],
    highlights: [
      'Thickness: 7.5 mil',
      'Gloss: 35 GU',
      'Coating elongation: 130%',
      'Anti-yellowing: 92% (∆E < 1)',
      ...PPF_FEATURES,
    ],
    imageAlt: 'Grey supercar in a satin finish with Fossil Stealth paint protection film',
    seo: {
      title: 'Stealth Clear Satin PPF',
      description:
        'Stealth is a Fossil satin paint protection film that turns gloss paint into a refined satin finish, with a 10 year warranty.',
    },
  },
  {
    slug: 'frozen',
    name: 'Frozen Clear Matte PPF',
    shortDescription: 'Bold protection with a true matte finish.',
    answer:
      'Frozen Matte is designed for drivers who want a bold, non-reflective aesthetic combined with serious surface protection. It carries a {warrantyYears} warranty.',
    body: [
      'Whether applied over factory gloss or OEM matte paint, Matte PPF delivers a uniform, flat finish while protecting against stone chips, scratches, and environmental damage.',
      'Unlike vinyl wraps, Matte PPF preserves the integrity of the original paint and offers self-healing performance, superior durability, and long-term stability.',
    ],
    highlights: [
      'Thickness: 7.5 mil',
      'Gloss: 15 GU',
      'Coating elongation: 130%',
      'Anti-yellowing: 92% (∆E < 1)',
      ...PPF_FEATURES,
    ],
    imageAlt: 'Supercar in a flat matte finish with Fossil Frozen paint protection film',
    seo: {
      title: 'Frozen Clear Matte PPF',
      description:
        'Frozen is a Fossil matte paint protection film: a uniform flat finish with self-healing protection and a 10 year warranty.',
    },
  },
  {
    slug: 'solaris',
    name: 'Solaris Ceramic Window Film',
    shortDescription: 'Ceramic window film with unmatched heat rejection.',
    answer:
      'FOSSIL Solaris Series Window Films set the industry standard with unmatched heat rejection, blocking maximum infrared and UV rays for superior cooling and comfort. The series carries a {warrantyYears} warranty.',
    body: [
      'Engineered for crystal-clear visibility and durability, they enhance energy efficiency, privacy, and interior protection like no other film.',
      'Solaris is available in five shades: Solaris 5, Solaris 15, Solaris 35, Solaris 50 and Solaris 70.',
    ],
    highlights: [
      'Solaris 5: 5% VLT, 97% IRR, 95% TSER',
      'Solaris 15: 15% VLT, 99% IRR, 91% TSER',
      'Solaris 35: 35% VLT, 99% IRR, 79% TSER',
      'Solaris 50: 47% VLT, 99% IRR, 72% TSER',
      'Solaris 70: 70% VLT, 96% IRR, 58% TSER',
      ...WINDOW_FILM_SPECS,
    ],
    imageAlt: 'Red coupe with Fossil Solaris ceramic window film',
    seo: {
      title: 'Solaris Ceramic Window Film',
      description:
        'Solaris is a Fossil ceramic window film in five shades, rejecting up to 99% of infrared and 99% of UV, with a 10 year warranty.',
    },
  },
  {
    slug: 'luminox',
    name: 'Luminox Ceramic Window Film',
    shortDescription: 'Advanced heat rejection, UV protection and glare reduction.',
    answer:
      'The Luminox Series window films offer advanced heat rejection, UV protection, and glare reduction, delivering premium performance for your vehicle. The series carries a {warrantyYears} warranty.',
    body: [
      'Designed for durability and clarity, Luminox enhances comfort, aesthetics, and energy efficiency for superior driving experience.',
      'Luminox is available in five shades: Luminox 5, Luminox 15, Luminox 35, Luminox 50 and Luminox 70.',
    ],
    highlights: [
      'Luminox 5: 5% VLT, 97% IRR, 95% TSER',
      'Luminox 15: 15% VLT, 99% IRR, 91% TSER',
      'Luminox 35: 35% VLT, 99% IRR, 79% TSER',
      'Luminox 50: 47% VLT, 99% IRR, 72% TSER',
      'Luminox 70: 70% VLT, 96% IRR, 58% TSER',
      ...WINDOW_FILM_SPECS,
    ],
    imageAlt: 'Red coupe with Fossil Luminox ceramic window film',
    seo: {
      title: 'Luminox Ceramic Window Film',
      description:
        'Luminox is a Fossil ceramic window film in five shades with advanced heat rejection, 99% UV rejection and a 10 year warranty.',
    },
  },
];
