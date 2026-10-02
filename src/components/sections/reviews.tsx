import { Star } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Section } from '@/components/ui/section';
import { ReviewsCarousel } from './reviews-carousel';
import type { SectionProps } from './types';

export async function Reviews({ section, data }: SectionProps<'reviews'>) {
  const t = await getTranslations({ locale: data.locale, namespace: 'reviews' });
  const { rating } = data.site.facts;
  const reviews = data.content.testimonials;
  if (reviews.length === 0) return null;

  return (
    <Section id={section.id} name="reviews" heading={section.heading} intro={section.intro} className="c-reviews">
      {rating && (
        <p className="c-rating-summary mb-4 font-medium">
          {t('summary', { rating: rating.value, count: rating.count, source: rating.source })}
        </p>
      )}
      <ReviewsCarousel label={section.heading} previousLabel={t('previous')} nextLabel={t('next')}>
        {reviews.map((review) => (
          <li key={review.id} className="c-card c-review w-[min(100%,24rem)] shrink-0 snap-start">
            <figure className="flex h-full flex-col gap-3">
              <p className="flex gap-0.5" role="img" aria-label={t('ratingLabel', { rating: review.rating })}>
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    aria-hidden="true"
                    className="size-4"
                    fill={i < review.rating ? 'currentColor' : 'none'}
                  />
                ))}
              </p>
              <blockquote>
                <p>{review.text}</p>
              </blockquote>
              <figcaption className="mt-auto text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{review.author}</span>
                {review.vehicle && <>, {review.vehicle}</>}
                <br />
                {review.source} · <time dateTime={review.date}>{review.dateLabel}</time>
              </figcaption>
            </figure>
          </li>
        ))}
      </ReviewsCarousel>
    </Section>
  );
}
