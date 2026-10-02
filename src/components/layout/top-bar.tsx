import { Clock, MapPin, Phone } from 'lucide-react';
import { WhatsAppIcon } from '@/components/icons/brand';
import { TrackedLink } from '@/components/ui/tracked-link';
import type { SiteView } from '@/lib/content';
import { LanguageSwitcher } from './language-switcher';

type TopBarLabels = { whatsapp: string; areaServed: string; language: string };

export function TopBar({
  site,
  whatsappUrl,
  labels,
  locales,
}: {
  site: SiteView;
  whatsappUrl: string;
  labels: TopBarLabels;
  locales: Array<{ code: string; label: string }>;
}) {
  return (
    <div className="c-top-bar border-b border-border bg-surface text-sm">
      <div className="c-container flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-2">
        <ul className="flex flex-wrap items-center gap-x-6 gap-y-1">
          <li>
            <TrackedLink
              href={`tel:${site.phone.e164}`}
              className="inline-flex items-center gap-1"
              event={{ name: 'call_click', location: 'top-bar' }}
            >
              <Phone aria-hidden="true" className="size-4" />
              <span dir="ltr">{site.phone.display}</span>
            </TrackedLink>
          </li>
          <li>
            <TrackedLink
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1"
              event={{ name: 'whatsapp_click', location: 'top-bar' }}
            >
              <WhatsAppIcon className="size-4" />
              {labels.whatsapp}
            </TrackedLink>
          </li>
          {site.hours[0] && (
            <li className="inline-flex items-center gap-1">
              <Clock aria-hidden="true" className="size-4" />
              {site.hours[0].days} <span dir="ltr">{site.hours[0].time}</span>
            </li>
          )}
          <li className="inline-flex items-center gap-1">
            <MapPin aria-hidden="true" className="size-4" />
            {labels.areaServed}
          </li>
        </ul>
        <LanguageSwitcher current={site.locale} locales={locales} label={labels.language} />
      </div>
    </div>
  );
}
