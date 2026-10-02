import Image from 'next/image';
import { CtaLink } from '@/components/ui/cta-link';
import { Link } from '@/i18n/navigation';
import type { SectionProps } from './types';

export function Hero({ section, data }: SectionProps<'hero'>) {
  const headingId = `${section.id}-heading`;
  const chips = section.serviceChips
    .map((slug) => data.content.services.find((s) => s.slug === slug))
    .filter((s) => s !== undefined);

  return (
    <section id={section.id} aria-labelledby={headingId} data-section="hero" className="c-hero c-section">
      <div className="c-container grid items-center gap-8 lg:grid-cols-2">
        <div className="c-hero-copy space-y-5">
          {section.eyebrow && <p className="c-hero-eyebrow text-sm text-muted-foreground">{section.eyebrow}</p>}
          <h1 id={headingId} className="text-4xl font-bold">
            {section.heading}
          </h1>
          <p className="c-hero-subheading text-lg text-muted-foreground">{section.subheading}</p>
          <div className="c-hero-ctas flex flex-wrap gap-3">
            <CtaLink
              cta={section.primaryCta}
              variant="primary"
              location="hero"
              phone={data.site.phone.e164}
              whatsappUrl={data.whatsappUrl}
            />
            <CtaLink
              cta={section.secondaryCta}
              location="hero"
              phone={data.site.phone.e164}
              whatsappUrl={data.whatsappUrl}
            />
          </div>
          {chips.length > 0 && (
            <ul className="c-hero-chips flex flex-wrap gap-2">
              {chips.map((service) => (
                <li key={service.slug}>
                  <Link
                    href={service.href}
                    className="c-chip inline-block rounded-md border border-border px-3 py-1 text-sm"
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {section.media?.type === 'image' && (
          <Image
            className="c-hero-media h-auto w-full rounded-lg"
            src={section.media.image.src}
            alt={section.media.image.alt}
            width={section.media.image.width}
            height={section.media.image.height}
            sizes="(min-width: 1024px) 50vw, 100vw"
            fetchPriority="high"
            loading="eager"
          />
        )}
        {section.media?.type === 'video' && (
          <video
            className="c-hero-media h-auto w-full rounded-lg"
            poster={section.media.poster.src}
            width={section.media.poster.width}
            height={section.media.poster.height}
            controls
            muted
            playsInline
            preload="none"
            aria-label={section.media.poster.alt}
          >
            <source src={section.media.src} />
          </video>
        )}
      </div>
    </section>
  );
}
