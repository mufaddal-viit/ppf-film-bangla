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
    <footer className="c-footer mt-16 border-t border-border bg-surface pb-24 lg:pb-0">
      <div className="c-container grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <nav aria-label={labels.nav} className="contents">
          {navigation.footer.map((group) => (
            <div key={group.title}>
              <h2 className="mb-3 font-semibold">{group.title}</h2>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div>
          <h2 className="mb-3 font-semibold">{labels.contact}</h2>
          <address className="space-y-1 not-italic">
            <span className="block font-medium">{site.name}</span>
            {site.addressLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
            <TrackedLink
              href={`tel:${site.phone.e164}`}
              dir="ltr"
              className="block"
              event={{ name: 'call_click', location: 'footer' }}
            >
              {site.phone.display}
            </TrackedLink>
            <a href={`mailto:${site.email}`} className="block">
              {site.email}
            </a>
          </address>
        </div>

        <div>
          <h2 className="mb-3 font-semibold">{labels.hours}</h2>
          <ul className="space-y-1">
            {site.hours.map((h) => (
              <li key={h.days}>
                {h.days}: <span dir="ltr">{h.time}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="c-container flex flex-wrap items-center justify-between gap-4 border-t border-border py-6 text-sm">
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
          <div className="flex items-center gap-3">
            <h2 className="text-muted-foreground">{labels.payments}</h2>
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

        <ul className="flex gap-4">
          {navigation.legal.map((link) => (
            <li key={link.href}>
              <Link href={link.href}>{link.label}</Link>
            </li>
          ))}
        </ul>
        <p className="w-full text-muted-foreground">{labels.rights}</p>
      </div>
    </footer>
  );
}
