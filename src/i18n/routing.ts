import { defineRouting } from 'next-intl/routing';
// Raw config on purpose: this module reaches the browser (via Link), and the validated loader
// would pull Zod and every config file into the client bundle. The loader still validates
// config/site.ts at build time.
import { site } from '../../config/site';

export const routing = defineRouting({
  locales: site.locale.locales,
  defaultLocale: site.locale.defaultLocale,
  localePrefix: 'always',
});
