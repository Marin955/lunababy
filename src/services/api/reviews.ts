import { api } from './client';

/** An approved, verified-purchase review as the public API returns it. */
export interface Review {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  author_display_name: string;
  locale: 'hr' | 'en';
  published_at: string;
  verified_purchase: true;
}

export interface ReviewsMeta {
  /** null when there are no approved reviews. */
  average_rating: number | null;
  total_count: number;
  current_page: number;
  total_pages: number;
}

export interface BundleReviews {
  data: Review[];
  meta: ReviewsMeta;
}

export const REVIEWS_PER_PAGE = 5;

export async function fetchBundleReviews(
  slug: string,
  { page = 1, per = REVIEWS_PER_PAGE, locale = 'hr' }: { page?: number; per?: number; locale?: string } = {}
): Promise<BundleReviews> {
  const query = new URLSearchParams({ page: String(page), per: String(per), locale });
  return api.get<BundleReviews>(`/bundles/${encodeURIComponent(slug)}/reviews?${query}`, { cache: 'no-store' });
}

/** Same as fetchBundleReviews, but null instead of throwing (the product page must render without reviews). */
export async function getBundleReviews(slug: string, locale: string): Promise<BundleReviews | null> {
  try {
    return await fetchBundleReviews(slug, { locale });
  } catch {
    return null;
  }
}

// Review form (token link from the review request email)

export interface ReviewFormContext {
  bundle: { slug: string; name: string; emoji: string | null };
  author_display_name: string;
  locale: 'hr' | 'en';
  expires_at: string;
  limits: { title_max: number; body_min: number; body_max: number };
}

/** "open" form context, or why the link can't be used. */
export type ReviewFormLookup =
  | { state: 'open'; context: ReviewFormContext }
  | { state: 'used' | 'expired' | 'not_found' | 'error' };

export async function fetchReviewForm(token: string, locale: string): Promise<ReviewFormLookup> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  try {
    const res = await fetch(
      `${API_URL}/api/v1/reviews/${encodeURIComponent(token)}?locale=${encodeURIComponent(locale)}`,
      { cache: 'no-store', headers: { Accept: 'application/json' } }
    );
    if (res.ok) {
      const json = (await res.json()) as { data: ReviewFormContext };
      return { state: 'open', context: json.data };
    }
    if (res.status === 404) return { state: 'not_found' };
    if (res.status === 410) {
      const json = (await res.json().catch(() => ({}))) as { code?: string };
      return { state: json.code === 'used' ? 'used' : 'expired' };
    }
    return { state: 'error' };
  } catch {
    return { state: 'error' };
  }
}

export interface ReviewSubmission {
  rating: number;
  title: string;
  body: string;
  consent: boolean;
  /** Language the review is written in (the form page's locale). */
  locale: string;
}

export async function submitReview(token: string, data: ReviewSubmission): Promise<void> {
  await api.post(`/reviews/${encodeURIComponent(token)}`, data);
}

// Admin moderation

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface AdminReview {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  author_display_name: string;
  locale: 'hr' | 'en';
  status: ReviewStatus;
  submitted_at: string;
  approved_at: string | null;
  created_at: string;
  order_number: string;
  customer_email: string;
  bundle: { id: string; slug: string; name: string };
}

export interface AdminReviewsResponse {
  data: AdminReview[];
  meta: {
    current_page: number;
    total_pages: number;
    total_count: number;
    counts: Partial<Record<ReviewStatus, number>>;
  };
}

export async function fetchAdminReviews(
  params: { page?: number; status?: ReviewStatus | '' },
  token: string
): Promise<AdminReviewsResponse> {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.status) query.set('status', params.status);
  return api.get<AdminReviewsResponse>(`/admin/reviews?${query}`, { token });
}

export async function moderateReview(
  id: string,
  action: 'approve' | 'reject',
  token: string
): Promise<AdminReview> {
  const res = await api.patch<{ data: AdminReview }>(`/admin/reviews/${id}/${action}`, undefined, { token });
  return res.data;
}
