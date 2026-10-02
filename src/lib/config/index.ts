/**
 * Validated site config. The only module allowed to import from /config.
 * Parsing happens once at import, so invalid config fails `next build` with a readable error.
 * Keep this file free of path aliases: next.config.ts imports it at build time.
 */
import { z } from 'zod';
import { catalog } from '../../../config/catalog';
import { features } from '../../../config/features';
import { forms } from '../../../config/forms';
import { integrations } from '../../../config/integrations';
import { layout } from '../../../config/layout';
import { navigation } from '../../../config/navigation';
import { pages } from '../../../config/pages';
import { security } from '../../../config/security';
import { seo } from '../../../config/seo';
import { site } from '../../../config/site';
import { theme } from '../../../config/theme';
import {
  catalogSchema,
  featuresConfigSchema,
  formsConfigSchema,
  integrationsConfigSchema,
  layoutConfigSchema,
  navigationConfigSchema,
  pagesConfigSchema,
  securityConfigSchema,
  seoConfigSchema,
  siteConfigSchema,
  themeConfigSchema,
} from './schema';

export function parseOrThrow<S extends z.ZodType>(schema: S, value: unknown, source: string): z.infer<S> {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new Error(`Invalid ${source}:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}

export const siteConfig = parseOrThrow(siteConfigSchema, site, 'config/site.ts');
export const catalogConfig = parseOrThrow(catalogSchema, catalog, 'config/catalog.ts');
export const navigationConfig = parseOrThrow(navigationConfigSchema, navigation, 'config/navigation.ts');
export const pagesConfig = parseOrThrow(pagesConfigSchema, pages, 'config/pages.ts');
export const layoutConfig = parseOrThrow(layoutConfigSchema, layout, 'config/layout.ts');
export const themeConfig = parseOrThrow(themeConfigSchema, theme, 'config/theme.ts');
export const seoConfig = parseOrThrow(seoConfigSchema, seo, 'config/seo.ts');
export const integrationsConfig = parseOrThrow(integrationsConfigSchema, integrations, 'config/integrations.ts');
export const formsConfig = parseOrThrow(formsConfigSchema, forms, 'config/forms.ts');
export const securityConfig = parseOrThrow(securityConfigSchema, security, 'config/security.ts');
export const featuresConfig = parseOrThrow(featuresConfigSchema, features, 'config/features.ts');

// Cross-file checks that a single schema cannot express.
const serviceSlugs = new Set(catalogConfig.services.map((s) => s.slug));
for (const pkg of catalogConfig.packages) {
  if (!serviceSlugs.has(pkg.serviceSlug)) {
    throw new Error(`Invalid config/catalog.ts: package "${pkg.id}" references unknown service "${pkg.serviceSlug}"`);
  }
}
for (const link of [...navigationConfig.header, ...navigationConfig.footer.flatMap((g) => g.links)]) {
  if ('service' in link.href && !serviceSlugs.has(link.href.service)) {
    throw new Error(
      `Invalid config/navigation.ts: link "${link.labelKey}" references unknown service "${link.href.service}"`,
    );
  }
}
