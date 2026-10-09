import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';
import { ADMIN_ROUTES, SESSION_COOKIE } from './lib/admin/constants';
import { VENDOR_ROUTES, VENDOR_SESSION_COOKIE } from './lib/vendor/constants';

/** Locale detection and prefixing for the public site. Security headers are set in next.config.ts. */
const handleLocale = createMiddleware(routing);

/** Signed-in areas outside the locale routes, each with its own login page and session cookie. */
const PORTALS = [
  { root: ADMIN_ROUTES.dashboard, login: ADMIN_ROUTES.login, cookie: SESSION_COOKIE },
  { root: VENDOR_ROUTES.dashboard, login: VENDOR_ROUTES.login, cookie: VENDOR_SESSION_COOKIE },
];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const portal = PORTALS.find(({ root }) => pathname === root || pathname.startsWith(`${root}/`));
  if (!portal) return handleLocale(request);
  // Portals have no locale prefix. This is only a fast redirect for visitors without a session
  // cookie; the real check against the database is requireSession() / requireVendorSession().
  if (pathname !== portal.login && !request.cookies.has(portal.cookie)) {
    return NextResponse.redirect(new URL(portal.login, request.url));
  }
  return NextResponse.next();
}

export const config = {
  // Skip API routes, Next internals, metadata files and anything with a file extension.
  matcher: ['/((?!api|_next|_vercel|llms.txt|sitemap.xml|robots.txt|manifest.webmanifest|.*\\..*).*)'],
};
