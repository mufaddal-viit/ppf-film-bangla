import { MapPin, Phone } from 'lucide-react';
import { WhatsAppIcon } from '@/components/icons/brand';
import { TrackedLink } from '@/components/ui/tracked-link';
import type { SiteView } from '@/lib/content';

type Action = 'call' | 'map' | 'whatsapp';

/** Sticky bottom bar on small screens with the three highest-intent actions. */
export function FloatingActions({
  site,
  whatsappUrl,
  actions,
  labels,
}: {
  site: SiteView;
  whatsappUrl: string;
  actions: Action[];
  labels: Record<Action, string> & { region: string };
}) {
  const items = {
    call: {
      href: `tel:${site.phone.e164}`,
      icon: <Phone aria-hidden="true" className="size-5" />,
      event: 'call_click' as const,
      external: false,
    },
    map: {
      href: site.mapUrl,
      icon: <MapPin aria-hidden="true" className="size-5" />,
      event: 'directions_click' as const,
      external: true,
    },
    whatsapp: {
      href: whatsappUrl,
      icon: <WhatsAppIcon className="size-5" />,
      event: 'whatsapp_click' as const,
      external: true,
    },
  };
  return (
    <nav
      aria-label={labels.region}
      className="c-floating-actions fixed inset-x-0 bottom-0 z-30 border-t border-border pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="grid" style={{ gridTemplateColumns: `repeat(${actions.length}, minmax(0, 1fr))` }}>
        {actions.map((action) => {
          const item = items[action];
          return (
            <li key={action}>
              <TrackedLink
                href={item.href}
                {...(item.external && { target: '_blank', rel: 'noopener noreferrer' })}
                className="flex min-h-14 flex-col items-center justify-center gap-1 text-sm"
                event={{ name: item.event, location: 'floating-actions' }}
              >
                {item.icon}
                {labels[action]}
              </TrackedLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
