'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/auth-store';
import {
  fetchAdminReviews,
  moderateReview,
  type AdminReview,
  type AdminReviewsResponse,
  type ReviewStatus,
} from '@/services/api/reviews';
import StarRating from '../StarRating';

const FILTERS: Array<ReviewStatus | ''> = ['pending', 'approved', 'rejected', ''];

const STATUS_CLASSES: Record<ReviewStatus, string> = {
  pending: 'bg-amber-100 text-amber-900',
  approved: 'bg-emerald-100 text-emerald-900',
  rejected: 'bg-gray-200 text-gray-800',
};

export default function AdminReviewsList() {
  const t = useTranslations('admin.reviews');
  const locale = useLocale();
  const token = useAuthStore((state) => state.token);
  const [status, setStatus] = useState<ReviewStatus | ''>('pending');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<AdminReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(false);
    try {
      setResult(await fetchAdminReviews({ status, page }, token));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [token, status, page]);

  useEffect(() => {
    load();
  }, [load]);

  async function moderate(review: AdminReview, action: 'approve' | 'reject') {
    if (!token) return;
    setBusyId(review.id);
    try {
      await moderateReview(review.id, action, token);
      await load();
    } catch {
      setError(true);
    } finally {
      setBusyId(null);
    }
  }

  const dateFormat = new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'hr-HR', { dateStyle: 'medium', timeZone: 'Europe/Zagreb' });
  const counts = result?.meta.counts ?? {};

  return (
    <div>
      <div role="group" aria-label={t('filterLabel')} className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map((f) => {
          const active = status === f;
          const count = f ? counts[f] ?? 0 : Object.values(counts).reduce((a, b) => a + (b ?? 0), 0);
          return (
            <button
              key={f || 'all'}
              type="button"
              aria-pressed={active}
              onClick={() => {
                setStatus(f);
                setPage(1);
              }}
              className={`min-h-10 px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                active ? 'bg-teal-deep text-white' : 'bg-white text-text-dark border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {t(`filters.${f || 'all'}`)} <span className="tabular-nums">({count})</span>
            </button>
          );
        })}
      </div>

      {error && (
        <p role="alert" className="mb-4 text-sm text-red-700">
          {t('error')}
        </p>
      )}

      {loading && !result ? (
        <div className="animate-pulse h-64 bg-gray-100 rounded-[--radius-md]" />
      ) : result && result.data.length === 0 ? (
        <p className="bg-white rounded-[--radius-md] shadow-sm p-8 text-center text-text-mid">{t('empty')}</p>
      ) : (
        <ul className={`flex flex-col gap-4 ${loading ? 'opacity-60' : ''}`}>
          {result?.data.map((review) => (
            <li key={review.id} className="bg-white rounded-[--radius-md] shadow-sm p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <StarRating rating={review.rating} label={t('stars', { rating: review.rating })} size="sm" />
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_CLASSES[review.status]}`}>
                      {t(`status.${review.status}`)}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-text-mid uppercase">
                      {review.locale}
                    </span>
                  </div>
                  <p className="text-sm text-text-mid break-words">
                    {review.bundle.name} · {review.order_number} · {review.author_display_name} ({review.customer_email})
                  </p>
                </div>
                <time className="text-sm text-text-mid" dateTime={review.submitted_at}>
                  {dateFormat.format(new Date(review.submitted_at))}
                </time>
              </div>

              {review.title && <h3 className="font-semibold text-text-dark mb-1 break-words">{review.title}</h3>}
              <p className="text-text-dark whitespace-pre-line break-words">{review.body}</p>

              <div className="flex flex-wrap gap-2 mt-4">
                {review.status !== 'approved' && (
                  <button
                    type="button"
                    disabled={busyId === review.id}
                    onClick={() => moderate(review, 'approve')}
                    className="min-h-10 px-4 py-2 rounded-[--radius-sm] bg-teal-deep text-white text-sm font-semibold hover:bg-teal transition-colors disabled:opacity-60 cursor-pointer"
                  >
                    {t('approve')}
                  </button>
                )}
                {review.status !== 'rejected' && (
                  <button
                    type="button"
                    disabled={busyId === review.id}
                    onClick={() => moderate(review, 'reject')}
                    className="min-h-10 px-4 py-2 rounded-[--radius-sm] border border-gray-300 text-text-dark text-sm font-semibold hover:bg-gray-50 transition-colors disabled:opacity-60 cursor-pointer"
                  >
                    {t('reject')}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {result && result.meta.total_pages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="min-h-10 px-4 py-2 rounded-[--radius-sm] border border-gray-300 text-sm disabled:opacity-40 cursor-pointer"
          >
            {t('previous')}
          </button>
          <span className="text-sm text-text-mid tabular-nums">
            {page} / {result.meta.total_pages}
          </span>
          <button
            type="button"
            disabled={page >= result.meta.total_pages}
            onClick={() => setPage(page + 1)}
            className="min-h-10 px-4 py-2 rounded-[--radius-sm] border border-gray-300 text-sm disabled:opacity-40 cursor-pointer"
          >
            {t('next')}
          </button>
        </div>
      )}
    </div>
  );
}
