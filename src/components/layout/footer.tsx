import { Banknote, CreditCard, Wallet } from 'lucide-react';
import { SOCIAL_ICONS } from '@/components/icons/brand';
import { TrackedLink } from '@/components/ui/tracked-link';
import { Link } from '@/i18n/navigation';
import type { NavigationView, SiteView } from '@/lib/content';

const PAYMENT_ICONS = { cash: Banknote, card: CreditCard } as const;

type FooterLabels = {
  nav: string;
  contact: string;
  hours: string;
  follow: string;
  payments: string;
  rights: string;
  newTab: string;
};

export function Footer({
  site,
  navigation,
  labels,
}: {
  site: SiteView;
  navigation: NavigationView;
  labels: FooterLabels;
}) {
  return (
    <footer data-tone="inverse" className="c-footer bg-background pb-24 text-foreground lg:pb-0">
      <div className="c-footer-brand">
        <div className="c-container">
          {/* Decorative wordmark; the business name is read from the contact block below. */}
          <p aria-hidden="true" className="c-footer-wordmark">
            {site.shortName}
          </p>
          <p className="c-footer-tagline">{site.tagline}</p>
        </div>
      </div>

      <div className="c-container c-footer-grid">
        <nav aria-label={labels.nav} className="contents">
          {navigation.footer.map((group) => (
            <div key={group.title} className="c-footer-col">
              <h2>{group.title}</h2>
              <ul className="c-footer-links">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="c-footer-col" data-wide="">
          <h2>{labels.contact}</h2>
          <address className="c-footer-address">
            <span className="block font-semibold">{site.name}</span>
            {site.addressLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
            <TrackedLink
              href={`tel:${site.phone.e164}`}
              dir="ltr"
              className="c-footer-phone"
              event={{ name: 'call_click', location: 'footer' }}
            >
              {site.phone.display}
            </TrackedLink>
            <a href={`mailto:${site.email}`} className="c-footer-email">
              {site.email}
            </a>
          </address>
        </div>

        {site.hours.length > 0 && (
          <div className="c-footer-col" data-wide="">
            <h2>{labels.hours}</h2>
            <ul className="space-y-1">
              {site.hours.map((h) => (
                <li key={h.days}>
                  {h.days}: <span dir="ltr">{h.time}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="c-container">
        <div className="c-footer-bar">
          <p className="c-footer-rights">{labels.rights}</p>

          {site.social.length > 0 && (
            <div>
              <h2 className="sr-only">{labels.follow}</h2>
              <ul className="flex gap-4">
                {site.social.map((s) => {
                  const SocialIcon = SOCIAL_ICONS[s.platform];
                  return (
                    <li key={s.platform}>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${s.label} ${labels.newTab}`}
                        className="c-footer-social"
                      >
                        <SocialIcon className="size-5" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {site.payments.length > 0 && (
            <div className="c-footer-payments">
              <h2>{labels.payments}</h2>
              <ul className="flex flex-wrap gap-3">
                {site.payments.map((p) => {
                  const PaymentIcon =
                    p.method in PAYMENT_ICONS ? PAYMENT_ICONS[p.method as keyof typeof PAYMENT_ICONS] : Wallet;
                  return (
                    <li key={p.method} className="inline-flex items-center gap-1">
                      <PaymentIcon aria-hidden="true" className="size-4" />
                      {p.label}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <ul className="c-footer-legal">
            {navigation.legal.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
