import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

/** Locale detection and prefixing. Security headers are set in next.config.ts. */
export default createMiddleware(routing);

export const config = {
  // Skip API routes, Next internals, metadata files and anything with a file extension.
  matcher: ['/((?!api|_next|_vercel|llms.txt|sitemap.xml|robots.txt|manifest.webmanifest|.*\\..*).*)'],
};
