import Image from 'next/image';
import type { CSSProperties } from 'react';
import type { SectionProps } from './types';

/**
 * Cinematic reel. Without scroll timelines (or with reduced motion) it is a swipeable
 * scroll-snap carousel; where they are supported the stage pins to the viewport and the page
 * scroll drives the slides sideways, with the photos drifting inside their frames.
 * All of the motion lives in src/app/styles/showcase.css.
 */
export function Showcase({ section }: SectionProps<'showcase'>) {
  const headingId = `${section.id}-heading`;
  const total = String(section.slides.length).padStart(2, '0');

  return (
    <section
      id={section.id}
      aria-labelledby={headingId}
      data-section="showcase"
      data-tone="inverse"
      className="c-showcase"
      style={{ '--slides': section.slides.length } as CSSProperties}
    >
      <div className="c-showcase-pin">
        <div className="c-showcase-head">
          <h2 id={headingId} className="c-showcase-heading">
            {section.heading}
          </h2>
          {section.intro && <p className="c-showcase-intro">{section.intro}</p>}
        </div>

        <ol className="c-showcase-track">
          {section.slides.map((slide, index) => (
            <li key={slide.title} className="c-showcase-slide" style={{ '--i': index } as CSSProperties}>
              <div className="c-showcase-media">
                <Image
                  src={slide.image.src}
                  alt={slide.image.alt}
                  width={slide.image.width}
                  height={slide.image.height}
                  sizes="100vw"
                  className="c-showcase-image"
                />
              </div>
              <div className="c-showcase-copy">
                <p className="c-showcase-count" aria-hidden="true">
                  <span className="c-showcase-index">{String(index + 1).padStart(2, '0')}</span>
                  <span className="c-showcase-total">{total}</span>
                </p>
                <h3 className="c-showcase-title">{slide.title}</h3>
                <p className="c-showcase-body">{slide.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div aria-hidden="true" className="c-showcase-progress">
          <span />
        </div>
      </div>
    </section>
  );
}
