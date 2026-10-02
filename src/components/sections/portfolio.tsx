import { getTranslations } from 'next-intl/server';
import { Section } from '@/components/ui/section';
import { PortfolioGrid } from './portfolio-grid';
import type { SectionProps } from './types';

export async function Portfolio({ section, data }: SectionProps<'portfolio'>) {
  const t = await getTranslations({ locale: data.locale, namespace: 'portfolio' });
  return (
    <Section id={section.id} name="portfolio" heading={section.heading} intro={section.intro} className="c-portfolio">
      <PortfolioGrid
        items={data.content.portfolio}
        showFilters={section.showFilters}
        labels={{ all: t('all'), filter: t('filterLabel') }}
      />
      {section.reels.length > 0 && (
        <div className="c-reels mt-8">
          <h3 className="mb-4 text-lg font-semibold">{t('reels')}</h3>
          <ul className="c-grid">
            {section.reels.map((reel) => (
              <li key={reel.src}>
                <video
                  className="h-auto w-full rounded-md"
                  poster={reel.poster.src}
                  width={reel.poster.width}
                  height={reel.poster.height}
                  controls
                  playsInline
                  preload="none"
                  aria-label={reel.title}
                >
                  <source src={reel.src} />
                </video>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Section>
  );
}
