import Image from 'next/image';
import type { CSSProperties } from 'react';
import { CtaLink } from '@/components/ui/cta-link';
import { Icon } from '@/components/ui/icon';
import { Link } from '@/i18n/navigation';
import { HeroParallax } from './hero-parallax';
import type { SectionProps } from './types';

/**
 * Water beads floating around the car, the way water sits on protected paint. Position and
 * width are percentages of the stage; `depth` is how far a bead travels with the pointer (bigger
 * reads as closer), `wide` beads are hidden on phones to keep the copy clear.
 */
const LEAVES = [
  { leaf: 'broad', x: '-1.5%', y: '5%', size: '6.5%', rot: -12, blur: 4, depth: 50, wide: false },
  { leaf: 'slim', x: '7%', y: '21%', size: '1.5%', rot: 18, blur: 0, depth: 20, wide: true },
  { leaf: 'broad', x: '12.5%', y: '8%', size: '2.6%', rot: 30, blur: 0, depth: 28, wide: true },
  { leaf: 'broad', x: '86.5%', y: '9%', size: '3.8%', rot: -20, blur: 0, depth: 32, wide: false },
  { leaf: 'slim', x: '93.5%', y: '29%', size: '1.4%', rot: 8, blur: 0, depth: 18, wide: true },
  { leaf: 'broad', x: '95%', y: '50%', size: '5.6%', rot: 14, blur: 3, depth: 54, wide: false },
  { leaf: 'slim', x: '3.5%', y: '60%', size: '2.2%', rot: -25, blur: 0, depth: 26, wide: true },
  { leaf: 'broad', x: '-2.5%', y: '82%', size: '7.5%', rot: 22, blur: 5, depth: 46, wide: true },
  { leaf: 'broad', x: '89.5%', y: '83%', size: '2.9%', rot: -8, blur: 0, depth: 34, wide: true },
  { leaf: 'slim', x: '9.5%', y: '90%', size: '1.3%', rot: 40, blur: 0, depth: 16, wide: true },
] as const;

/** Custom properties consumed by the .c-hero-* rules in globals.css. */
const vars = (values: Record<`--${string}`, string | number>) => values as CSSProperties;

export function Hero({ section, data }: SectionProps<'hero'>) {
  const headingId = `${section.id}-heading`;
  const chips = section.serviceChips
    .map((slug) => data.content.services.find((s) => s.slug === slug))
    .filter((s) => s !== undefined);
  const [before, after] = section.headingHighlight ? section.heading.split(section.headingHighlight) : [];
  const car = section.media?.type === 'image' ? section.media.image : null;

  return (
    <section
      id={section.id}
      aria-labelledby={headingId}
      data-section="hero"
      // Re-scopes the colour tokens so the stage can use a different mode from the rest of the site.
      data-theme={data.theme.name}
      data-mode={data.theme.heroMode}
      className="c-hero"
    >
      <HeroParallax className="c-hero-stage">
        <div aria-hidden="true" className="c-hero-floor" />

        <div className="c-container relative">
          {section.eyebrow && <p className="c-hero-eyebrow">{section.eyebrow}</p>}

          {/* The scene is a fixed left-to-right composition: it must not mirror in RTL. */}
          <div className="c-hero-scene" dir="ltr">
            <div
              aria-hidden="true"
              className="c-hero-layer c-hero-stripe"
              data-tone="ink"
              style={vars({ '--dx': -10 })}
            />
            <div
              aria-hidden="true"
              className="c-hero-layer c-hero-wordmark"
              style={vars({ '--dx': -16, '--dy': -8, '--ds': 70 })}
            >
              <svg viewBox="0 0 1000 200" role="presentation" focusable="false">
                <text x="0" y="190" textLength="1000" lengthAdjust="spacingAndGlyphs">
                  {section.wordmark}
                </text>
              </svg>
            </div>
            <div
              aria-hidden="true"
              className="c-hero-layer c-hero-stripe"
              data-tone="primary"
              style={vars({ '--dx': -6 })}
            />

            {car && (
              <div className="c-hero-layer c-hero-car" style={vars({ '--dx': 14, '--dy': 4, '--ds': -24 })}>
                <div className="c-hero-car-body" style={vars({ '--car': `url(${car.src})` })}>
                  <span aria-hidden="true" className="c-hero-shadow" />
                  <span
                    aria-hidden="true"
                    className="c-hero-reflection"
                    style={{ aspectRatio: `${car.width} / ${car.height}` }}
                  />
                  {/* One unoptimised file on purpose: the same URL is reused as the reflection and the sweep mask. */}
                  <Image
                    src={car.src}
                    alt={car.alt}
                    width={car.width}
                    height={car.height}
                    unoptimized
                    fetchPriority="high"
                    loading="eager"
                    className="relative h-auto w-full"
                  />
                  <span aria-hidden="true" className="c-hero-sweep" />
                </div>
              </div>
            )}
          </div>

          <div className="c-hero-copy">
            <h1 id={headingId} className="c-hero-heading">
              {before === undefined ? (
                section.heading
              ) : (
                <>
                  {before}
                  <span className="text-primary">{section.headingHighlight}</span>
                  {after}
                </>
              )}
            </h1>
            <p className="c-hero-subheading">{section.subheading}</p>

            {section.stats.length > 0 && (
              <dl className="c-hero-stats">
                {section.stats.map((stat) => (
                  <div key={stat.label} className="c-hero-stat">
                    <Icon name={stat.icon} className="size-5 shrink-0 text-muted-foreground" />
                    <div className="flex flex-col-reverse text-start">
                      <dt className="c-hero-stat-label">{stat.label}</dt>
                      <dd className="c-hero-stat-value">{stat.value}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            )}

            <div className="c-hero-ctas">
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
              <ul className="c-hero-chips flex flex-wrap justify-center gap-2">
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
        </div>

        <div aria-hidden="true" className="c-hero-leaves">
          {LEAVES.map((leaf, i) => (
            <span
              key={i}
              className="c-hero-layer c-hero-leaf"
              data-leaf={leaf.leaf}
              data-wide-only={leaf.wide || undefined}
              style={vars({
                '--x': leaf.x,
                '--y': leaf.y,
                '--size': leaf.size,
                '--rot': `${leaf.rot}deg`,
                '--blur': `${leaf.blur}px`,
                '--i': i,
                '--dx': leaf.depth,
                '--dy': leaf.depth * 0.6,
                '--ds': -leaf.depth * 3,
              })}
            />
          ))}
        </div>
      </HeroParallax>
    </section>
  );
}
