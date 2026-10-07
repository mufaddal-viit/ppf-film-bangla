import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';
import { ADMIN_ROUTES, SESSION_COOKIE } from './lib/admin/constants';

/** Locale detection and prefixing for the public site. Security headers are set in next.config.ts. */
const handleLocale = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname !== ADMIN_ROUTES.dashboard && !pathname.startsWith(`${ADMIN_ROUTES.dashboard}/`)) {
    return handleLocale(request);
  }
  // The admin panel has no locale prefix. This is only a fast redirect for visitors without a
  // session cookie; the real check against the database is requireSession() in src/lib/auth/session.ts.
  if (pathname !== ADMIN_ROUTES.login && !request.cookies.has(SESSION_COOKIE)) {
    return NextResponse.redirect(new URL(ADMIN_ROUTES.login, request.url));
  }
  return NextResponse.next();
}

export const config = {
  // Skip API routes, Next internals, metadata files and anything with a file extension.
  matcher: ['/((?!api|_next|_vercel|llms.txt|sitemap.xml|robots.txt|manifest.webmanifest|.*\\..*).*)'],
};
