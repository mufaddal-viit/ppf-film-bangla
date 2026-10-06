import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import type { NavItem, SiteView } from '@/lib/content';
import { HeaderNav } from './header-nav';
import { HeaderShell } from './header-shell';

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
  whatsappUrl?: string;
  labels: { nav: string; open: string; close: string; quote: string; home: string };
}) {
  return (
    <HeaderShell>
      <div className="c-container flex h-full items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="c-logo flex shrink-0 items-center" aria-label={`${site.name}, ${labels.home}`}>
          <Image
            src={site.logo.src}
            alt={site.name}
            width={site.logo.width}
            height={site.logo.height}
            className="h-8 w-auto transition-transform hover:scale-[1.02] sm:h-9"
            loading="eager"
            priority
          />
        </Link>

        {/* Center / Navigation and Mobile Controls */}
        <HeaderNav items={items} labels={labels} site={site} whatsappUrl={whatsappUrl} />

        {/* Desktop CTA Action Button */}
        <div className="hidden shrink-0 items-center gap-3 lg:flex">
          {showQuoteButton && (
            <Link
              href="/contact"
              className="c-header-cta inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background shadow-sm transition-all duration-200 hover:bg-primary hover:text-primary-foreground"
              aria-label={labels.quote}
            >
              <span>{labels.quote}</span>
              <span className="grid size-6 place-items-center rounded-full bg-primary text-xs text-primary-foreground">
                <ArrowUpRight className="size-3.5 rtl:-scale-x-100" aria-hidden="true" />
              </span>
            </Link>
          )}
        </div>
      </div>
    </HeaderShell>
  );
}
