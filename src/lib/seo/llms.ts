import { ROUTES, type ResolvedContent, type SiteView } from '@/lib/content';

/**
 * /llms.txt: a plain-language summary for AI assistants. Every fact comes from the
 * same config and content as the pages, so answers stay consistent with the site.
 */
export function buildLlmsTxt({
  site,
  content,
  url,
  otherLocales,
}: {
  site: SiteView;
  content: ResolvedContent;
  url: (path: string) => string;
  otherLocales: Array<{ code: string; url: string }>;
}): string {
  const pages = (['services', 'prices', 'gallery', 'about', 'contact'] as const).map((key) => ({
    title: content.pages[key].title,
    path: ROUTES[key],
  }));
  const lines = [
    `# ${site.name}`,
    '',
    `> ${site.description}`,
    '',
    '## Key facts',
    `- Address: ${[site.address.street, site.address.area, site.address.city, site.address.emirate].join(', ')}`,
    `- Phone: ${site.phone.display}`,
    `- WhatsApp: ${site.whatsapp.url}`,
    `- Email: ${site.email}`,
    `- Opening hours (${site.timezone}): ${site.hoursText}`,
    `- Areas served: ${site.areaServed}`,
    `- Map: ${site.mapUrl}`,
    ...(site.facts.rating
      ? [
          `- Rating: ${site.facts.rating.value}/5 from ${site.facts.rating.count} reviews on ${site.facts.rating.source}`,
        ]
      : []),
    '',
    '## Services',
    ...content.services.map((s) => {
      const facts = [
        s.priceFromLabel && `from ${s.priceFromLabel}`,
        s.warrantyLabel && `warranty up to ${s.warrantyLabel}`,
        s.turnaroundLabel && `about ${s.turnaroundLabel}`,
      ].filter(Boolean);
      return `- [${s.name}](${url(s.href)}): ${s.answer}${facts.length ? ` (${facts.join('; ')})` : ''}`;
    }),
    '',
    '## Packages',
    ...content.packages.map((p) => `- ${p.name}: from ${p.priceFromLabel}. ${p.description}`),
    '',
    '## Frequently asked questions',
    ...content.faqs.flatMap((f) => [`### ${f.question}`, f.answer, '']),
    '## Pages',
    ...pages.map((p) => `- [${p.title}](${url(p.path)})`),
    ...otherLocales.map((l) => `- [Site in ${l.code}](${l.url})`),
    '',
  ];
  return lines.join('\n');
}
