'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { PortfolioView } from '@/lib/content';

/** Filterable project grid. Every item stays in the server HTML; filtering only hides items. */
export function PortfolioGrid({
  items,
  showFilters,
  labels,
}: {
  items: PortfolioView[];
  showFilters: boolean;
  labels: { all: string; filter: string };
}) {
  const [active, setActive] = useState<string | null>(null);
  const filters = [...new Map(items.map((i) => [i.serviceSlug, i.serviceName])).entries()];

  return (
    <>
      {showFilters && filters.length > 1 && (
        <div role="group" aria-label={labels.filter} className="c-portfolio-filters">
          {[[null, labels.all] as const, ...filters].map(([slug, name]) => (
            <button
              key={slug ?? 'all'}
              type="button"
              className="c-button"
              aria-pressed={active === slug}
              data-variant={active === slug ? 'primary' : undefined}
              onClick={() => setActive(slug)}
            >
              {name}
            </button>
          ))}
        </div>
      )}
      <ul className="c-portfolio-grid">
        {items.map((item) => (
          <li key={item.id} hidden={active !== null && item.serviceSlug !== active}>
            <figure className="c-portfolio-item">
              <Image
                src={item.image.src}
                alt={item.image.alt}
                width={item.image.width}
                height={item.image.height}
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="c-portfolio-image"
              />
              <figcaption className="c-portfolio-caption">
                <span className="c-portfolio-vehicle">{item.vehicle}</span>
                <span className="c-portfolio-title">{item.title}</span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </>
  );
}
