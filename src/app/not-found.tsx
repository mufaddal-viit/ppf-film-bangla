import { routing } from '@/i18n/routing';

/** Requests outside any locale (rare: the proxy redirects most). Locale pages use [locale]/not-found.tsx. */
export default function GlobalNotFound() {
  return (
    <html lang={routing.defaultLocale}>
      <body>
        <main>
          <h1>404</h1>
          <a href={`/${routing.defaultLocale}`}>Home</a>
        </main>
      </body>
    </html>
  );
}
