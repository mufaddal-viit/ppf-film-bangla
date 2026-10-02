import { describe, expect, it } from 'vitest';
import { siteConfig } from '@/lib/config';
import { getContent, getNavigation, getPageSections, getSite } from '@/lib/content';
import { fillTokens, groupConsecutiveDays } from '@/lib/content/format';
import { localeContentSchema } from '@/lib/content/schema';
import { fileContentSource } from '@/lib/content/source';

describe.each(siteConfig.locale.locales)('content (%s)', (locale) => {
  it('matches the content schema', async () => {
    const result = localeContentSchema.safeParse(await fileContentSource.loadContent(locale));
    expect(result.success, result.success ? '' : result.error.message).toBe(true);
  });

  it('resolves through the loader with config facts filled in', async () => {
    const content = await getContent(locale);
    for (const service of content.services) {
      expect(service.answer).not.toMatch(/\{\w+\}/);
      expect(service.image.alt.length).toBeGreaterThan(0);
    }
    const ppf = content.services.find((s) => s.slug === 'paint-protection-film');
    expect(ppf?.priceFromLabel).toMatch(/4,500/);
  });

  it('builds the home page section list and navigation', async () => {
    const sections = await getPageSections('home', locale);
    expect(sections.map((s) => s.key)).toContain('hero');
    const nav = await getNavigation(locale);
    expect(nav.header.length).toBeGreaterThan(0);
    const site = await getSite(locale);
    expect(site.dir).toBe(siteConfig.locale.rtlLocales.includes(locale) ? 'rtl' : 'ltr');
  });
});

describe('format helpers', () => {
  it('groups consecutive weekdays', () => {
    expect(groupConsecutiveDays(['Monday', 'Tuesday', 'Wednesday', 'Friday'])).toEqual([
      ['Monday', 'Wednesday'],
      ['Friday', 'Friday'],
    ]);
  });

  it('fails loudly on unknown or empty tokens', () => {
    expect(fillTokens('From {price}', { price: 'AED 5' }, 'test')).toBe('From AED 5');
    expect(() => fillTokens('{missing}', {}, 'test')).toThrow(/Unknown token/);
    expect(() => fillTokens('{warranty}', { warranty: null }, 'test')).toThrow(/no value/);
  });
});
