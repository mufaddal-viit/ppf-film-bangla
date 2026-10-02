'use client';

import { Link, usePathname } from '@/i18n/navigation';

/** Links to the current page in every other locale. */
export function LanguageSwitcher({
  current,
  locales,
  label,
}: {
  current: string;
  locales: Array<{ code: string; label: string }>;
  label: string;
}) {
  const pathname = usePathname();
  return (
    <nav aria-label={label} className="c-language-switcher">
      <ul className="flex gap-3">
        {locales
          .filter((l) => l.code !== current)
          .map((l) => (
            <li key={l.code}>
              <Link href={pathname} locale={l.code} hrefLang={l.code} lang={l.code} className="underline">
                {l.label}
              </Link>
            </li>
          ))}
      </ul>
    </nav>
  );
}
