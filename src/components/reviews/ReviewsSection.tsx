import React from 'react';
import { getTranslations } from 'next-intl/server';
import type { BundleReviews } from '@/services/api/reviews';
import StarRating from './StarRating';
import ReviewList from './ReviewList';

interface ReviewsSectionProps {
  slug: string;
  locale: string;
  reviews: BundleReviews | null;
}

/**
 * Product page reviews: average, count and the latest approved reviews.
 * Renders nothing at all when there is no approved review (no "0 reviews").
 */
export default async function ReviewsSection({ slug, locale, reviews }: ReviewsSectionProps) {
  if (!reviews || reviews.meta.total_count < 1 || reviews.meta.average_rating == null || reviews.data.length === 0) {
    return null;
  }

  const t = await getTranslations({ locale, namespace: 'reviews' });
  const average = reviews.meta.average_rating;
  const averageText = new Intl.NumberFormat(locale === 'en' ? 'en-GB' : 'hr-HR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(average);

  return (
    <section id="reviews" aria-labelledby="reviews-title" className="mt-16 sm:mt-20 scroll-mt-24">
      <div className="grid grid-cols-1 lg:grid-cols-[18rem_minmax(0,1fr)] gap-8 lg:gap-12">
        <div>
          <h2 id="reviews-title" className="font-heading text-2xl sm:text-3xl font-semibold text-text-dark mb-4">
            {t('title')}
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-4xl font-semibold text-text-dark tabular-nums">{averageText}</span>
            <div className="flex flex-col gap-1">
              <StarRating rating={average} label={t('starsLabel', { rating: averageText })} />
              <span className="text-sm text-text-mid">{t('count', { count: reviews.meta.total_count })}</span>
            </div>
          </div>
          <p className="mt-4 text-[13px] text-text-mid leading-relaxed">{t('note')}</p>
        </div>

        <ReviewList
          slug={slug}
          locale={locale}
          initialReviews={reviews.data}
          totalPages={reviews.meta.total_pages}
        />
      </div>
    </section>
  );
}
