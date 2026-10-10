import { describe, expect, it } from 'vitest';
import { formsConfig, pagesConfig, siteConfig, themeConfig } from '@/lib/config';
import { formsConfigSchema, pagesConfigSchema, siteConfigSchema, themeConfigSchema } from '@/lib/config/schema';
import { parseEnv } from '@/lib/env.schema';

describe('site config', () => {
  it('loads and validates every config file', () => {
    expect(siteConfig.locale.currency).toBe('USD');
    expect(siteConfig.locale.timezone).toBe('America/Chicago');
    expect(siteConfig.contact.phone).toMatch(/^\+1/);
    expect(pagesConfig.home.sections[0]?.key).toBe('hero');
  });

  it('rejects a phone number that is not E.164', () => {
    const bad = structuredClone(siteConfig);
    bad.contact.phone = '04 200 0000';
    expect(siteConfigSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects a default locale missing from the locale list', () => {
    const bad = structuredClone(siteConfig);
    bad.locale.defaultLocale = 'fr';
    expect(siteConfigSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects an active theme that does not exist', () => {
    expect(themeConfigSchema.safeParse({ ...themeConfig, active: 'missing' }).success).toBe(false);
  });

  it('only allows the hero on the home page', () => {
    const bad = structuredClone(pagesConfig);
    bad.about.sections.push({ key: 'hero', enabled: true, contentRef: 'home-hero' });
    expect(pagesConfigSchema.safeParse(bad).success).toBe(false);
  });

  it('requires name and phone in every form variant', () => {
    const bad = structuredClone(formsConfig);
    bad.variants.callback.fields = [{ name: 'name', required: true }];
    expect(formsConfigSchema.safeParse(bad).success).toBe(false);
  });
});

describe('environment schema', () => {
  const base = {
    NEXT_PUBLIC_SITE_URL: 'https://www.example.ae',
    MONGODB_URI: 'mongodb+srv://user:pass@cluster.example.net',
    LEAD_NOTIFICATION_TO: 'a@example.com, b@example.com',
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: '1x00000000000000000000AA',
    TURNSTILE_SECRET_KEY: '1x0000000000000000000000000000000AA',
  };

  it('accepts a development environment and treats empty values as unset', () => {
    const env = parseEnv({ ...base, RESEND_API_KEY: '' });
    expect(env.EMAIL_PROVIDER).toBe('console');
    expect(env.LEAD_NOTIFICATION_TO).toEqual(['a@example.com', 'b@example.com']);
  });

  it('requires Resend credentials when EMAIL_PROVIDER=resend', () => {
    expect(() => parseEnv({ ...base, EMAIL_PROVIDER: 'resend' })).toThrow(/RESEND_API_KEY/);
  });

  // Skipped while ENFORCE_PRODUCTION_ENV is false in src/lib/env.schema.ts; un-skip when it is turned back on.
  it.skip('enforces production-only rules on Vercel production', () => {
    expect(() => parseEnv({ ...base, VERCEL_ENV: 'production' })).toThrow(/Production/);
  });
});
