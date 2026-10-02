import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import type { NavItem, SiteView } from '@/lib/content';
import { HeaderNav } from './header-nav';

export function Header({
  site,
  items,
  showQuoteButton,
  labels,
}: {
  site: SiteView;
  items: NavItem[];
  showQuoteButton: boolean;
  labels: { nav: string; open: string; close: string; quote: string; home: string };
}) {
  return (
    <header className="c-header border-b border-border">
      <div className="c-container flex flex-wrap items-center justify-between gap-4 py-4">
        <Link href="/" className="c-logo" aria-label={`${site.name}, ${labels.home}`}>
          <Image src={site.logo.src} alt="" width={site.logo.width} height={site.logo.height} loading="eager" />
        </Link>
        <HeaderNav items={items} labels={labels} />
        {showQuoteButton && (
          <Link href="/contact" className="c-button" data-variant="primary">
            {labels.quote}
          </Link>
        )}
      </div>
    </header>
  );
}
