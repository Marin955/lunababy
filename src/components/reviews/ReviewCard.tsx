import React from 'react';
import type { Review } from '@/services/api/reviews';
import StarRating from './StarRating';

interface ReviewCardProps {
  review: Review;
  locale: string;
  labels: { stars: string; verified: string };
}

export default function ReviewCard({ review, locale, labels }: ReviewCardProps) {
  const date = new Date(review.published_at);
  const dateText = new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'hr-HR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Zagreb',
  }).format(date);

  return (
    <article className="py-6 border-b border-gray-200 last:border-b-0" lang={review.locale}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
        <StarRating rating={review.rating} label={labels.stars} size="sm" />
        {review.title && <h3 className="font-semibold text-text-dark">{review.title}</h3>}
      </div>
      <p className="text-text-dark leading-relaxed whitespace-pre-line break-words">{review.body}</p>
      <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-text-mid" lang={locale}>
        <span className="font-semibold text-text-dark">{review.author_display_name}</span>
        <span aria-hidden="true">·</span>
        <time dateTime={review.published_at}>{dateText}</time>
        <span aria-hidden="true">·</span>
        <span className="inline-flex items-center gap-1 text-emerald-700">
          <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 111.4-1.4L8 12.58l7.3-7.3a1 1 0 011.4 0z" clipRule="evenodd" />
          </svg>
          {labels.verified}
        </span>
      </p>
    </article>
  );
}
