import { Link } from '@/i18n/navigation';
import type { Cta } from '@/lib/content/schema';
import { TrackedLink } from './tracked-link';

/** Renders a content-defined call to action as a route link, phone link or WhatsApp link. */
export function CtaLink({
  cta,
  phone,
  whatsappUrl,
  location,
  variant = 'secondary',
}: {
  cta: Cta;
  phone: string;
  whatsappUrl: string;
  /** Where on the page the CTA sits, sent with click events. */
  location: string;
  variant?: 'primary' | 'secondary';
}) {
  switch (cta.action) {
    case 'route':
      return (
        <Link href={cta.href} className="c-button" data-variant={variant}>
          {cta.label}
        </Link>
      );
    case 'call':
      return (
        <TrackedLink
          href={`tel:${phone}`}
          className="c-button"
          data-variant={variant}
          event={{ name: 'call_click', location }}
        >
          {cta.label}
        </TrackedLink>
      );
    case 'whatsapp':
      return (
        <TrackedLink
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="c-button"
          data-variant={variant}
          event={{ name: 'whatsapp_click', location }}
        >
          {cta.label}
        </TrackedLink>
      );
  }
}
