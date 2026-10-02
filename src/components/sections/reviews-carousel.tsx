'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, type ReactNode } from 'react';

/**
 * Scroll-snap carousel. All slides are in the HTML (crawlable, works without JS);
 * the buttons only scroll the list. Arrow icons flip automatically in RTL.
 */
export function ReviewsCarousel({
  label,
  previousLabel,
  nextLabel,
  children,
}: {
  label: string;
  previousLabel: string;
  nextLabel: string;
  children: ReactNode;
}) {
  const listRef = useRef<HTMLUListElement>(null);
  const scroll = (direction: 1 | -1) => {
    const list = listRef.current;
    if (!list) return;
    const rtl = getComputedStyle(list).direction === 'rtl' ? -1 : 1;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    list.scrollBy({ left: direction * rtl * list.clientWidth * 0.8, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  return (
    <div role="region" aria-roledescription="carousel" aria-label={label} className="c-carousel">
      <ul ref={listRef} className="c-carousel-track flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
        {children}
      </ul>
      <div className="c-carousel-controls mt-4 flex gap-2">
        <button type="button" className="c-button" onClick={() => scroll(-1)} aria-label={previousLabel}>
          <ChevronLeft aria-hidden="true" className="size-5 rtl:rotate-180" />
        </button>
        <button type="button" className="c-button" onClick={() => scroll(1)} aria-label={nextLabel}>
          <ChevronRight aria-hidden="true" className="size-5 rtl:rotate-180" />
        </button>
      </div>
    </div>
  );
}
