// Plain helper (no 'use client') so the product page server component can call it.
import type { BundleReviews } from '@/services/api/reviews';

/**
 * schema.org aggregateRating + review for the Product JSON-LD.
 * Returns undefined when there is no approved review, so nothing is added.
 */
export function buildReviewJsonLd(reviews: BundleReviews | null): Record<string, unknown> | undefined {
  if (!reviews || reviews.meta.total_count < 1 || reviews.meta.average_rating == null || reviews.data.length === 0) {
    return undefined;
  }

  return {
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: reviews.meta.average_rating,
      reviewCount: reviews.meta.total_count,
      bestRating: 5,
      worstRating: 1,
    },
    review: reviews.data.map((r) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: r.author_display_name },
      datePublished: r.published_at,
      ...(r.title ? { name: r.title } : {}),
      reviewBody: r.body,
      inLanguage: r.locale,
      reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5, worstRating: 1 },
    })),
  };
}
