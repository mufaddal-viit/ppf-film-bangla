import { ArrowUpRight, Phone } from 'lucide-react';
import Image from 'next/image';
import { TrackedLink } from '@/components/ui/tracked-link';
import { Link } from '@/i18n/navigation';
import type { NavItem, SiteView } from '@/lib/content';
import { HeaderNav, type HeaderLabels } from './header-nav';
import { HeaderShell } from './header-shell';

/**
 * Site header: logo, the main links in the middle and the call and contact actions on the end.
 * Below lg the links move into a full-screen menu (HeaderNav) and the bar keeps a call button.
 */
export function Header({
  site,
  items,
  showQuoteButton,
  whatsappUrl,
  labels,
}: {
  site: SiteView;
  items: NavItem[];
  showQuoteButton: boolean;
  /** Only passed when WhatsApp is enabled. */
  whatsappUrl?: string;
  labels: HeaderLabels;
}) {
  const logo = (
    <Image
      src={site.logo.src}
      alt={site.name}
      width={site.logo.width}
      height={site.logo.height}
      className="h-8 w-auto sm:h-9"
      loading="eager"
      priority
    />
  );

  return (
    <HeaderShell>
      <div className="c-header-bar">
        <Link href="/" className="c-header-logo" aria-label={`${site.name}, ${labels.home}`}>
          {logo}
        </Link>

        <HeaderNav
          items={items}
          labels={labels}
          site={{ name: site.name, logo: site.logo, phone: site.phone }}
          whatsappUrl={whatsappUrl}
          showQuoteButton={showQuoteButton}
        />

        <div className="c-header-actions">
          <TrackedLink
            href={`tel:${site.phone.e164}`}
            className="c-header-phone"
            event={{ name: 'call_click', location: 'header' }}
          >
            <span className="c-header-phone-icon">
              <Phone aria-hidden="true" />
            </span>
            <span dir="ltr">{site.phone.display}</span>
          </TrackedLink>
          {showQuoteButton && (
            <Link href="/contact" className="c-header-cta">
              <span>{labels.quote}</span>
              <ArrowUpRight aria-hidden="true" className="rtl:-scale-x-100" />
            </Link>
          )}
        </div>
      </div>
    </HeaderShell>
  );
}
