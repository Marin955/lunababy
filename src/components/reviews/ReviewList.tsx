'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { fetchBundleReviews, type Review } from '@/services/api/reviews';
import ReviewCard from './ReviewCard';

interface ReviewListProps {
  slug: string;
  locale: string;
  initialReviews: Review[];
  totalPages: number;
}

/** Approved reviews with "show more" (next page appended below). */
export default function ReviewList({ slug, locale, initialReviews, totalPages }: ReviewListProps) {
  const t = useTranslations('reviews');
  const [reviews, setReviews] = useState(initialReviews);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function loadMore() {
    setLoading(true);
    setError(false);
    try {
      const next = await fetchBundleReviews(slug, { page: page + 1, locale });
      setReviews((prev) => {
        const seen = new Set(prev.map((r) => r.id));
        return [...prev, ...next.data.filter((r) => !seen.has(r.id))];
      });
      setPage(page + 1);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div>
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            locale={locale}
            labels={{ stars: t('starsLabel', { rating: review.rating }), verified: t('verified') }}
          />
        ))}
      </div>

      {page < totalPages && (
        <div className="mt-6 flex flex-col items-start gap-2">
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            className="min-h-11 px-5 py-2.5 rounded-[--radius-md] border-2 border-teal text-teal-deep font-semibold text-sm hover:bg-teal-pale transition-colors disabled:opacity-60 cursor-pointer"
          >
            {loading ? t('loading') : t('showMore')}
          </button>
          {error && (
            <p role="alert" className="text-sm text-red-700">
              {t('loadError')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
