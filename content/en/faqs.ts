import type { LocaleContentInput } from '../../src/lib/content/schema';

/** Answers open with a direct, self-contained sentence. FAQs with a serviceSlug appear on that service page. */
export const faqs: LocaleContentInput['faqs'] = [
  {
    id: 'ppf-vs-ceramic',
    question: 'Should I choose PPF or ceramic coating?',
    answer:
      'Choose PPF if you want physical protection from stone chips and scratches; choose ceramic coating if you mainly want gloss and easier cleaning. Many owners combine both: PPF on high-impact areas and ceramic coating on top.',
  },
  {
    id: 'how-long-ppf',
    question: 'How long does paint protection film last?',
    answer:
      'Quality PPF lasts many years in UAE conditions, and ours carries a warranty of up to {warrantyYearsMax}. Regular hand washing helps it stay clear and glossy.',
  },
  {
    id: 'where-located',
    question: 'Where is {businessName} located?',
    answer: '{businessName} is in {area}, {city}. We serve customers across {areaServed}.',
  },
  {
    id: 'opening-hours',
    question: 'What are your opening hours?',
    answer: 'We are open {hours}.',
  },
  {
    id: 'ppf-damage-paint',
    question: 'Will PPF damage my paint when removed?',
    answer:
      'No. Professionally installed PPF peels off factory paint cleanly. We remove old film with heat and the right adhesive release to protect the clear coat.',
    serviceSlug: 'paint-protection-film',
  },
  {
    id: 'ceramic-wash',
    question: 'When can I wash my car after ceramic coating?',
    answer:
      'Wait 7 days before the first wash so the coating can fully cure, then hand wash with a pH-neutral shampoo.',
    serviceSlug: 'ceramic-coating',
  },
  {
    id: 'tint-legal',
    question: 'What tint percentage is legal in the UAE?',
    answer:
      'UAE rules allow up to 50% tint on side and rear windows, and the windscreen must stay clear. We help you pick a compliant film before installation.',
    serviceSlug: 'window-tinting',
  },
];
