import { api } from './client';
import type { Bundle, BundleDetail } from '@/types';

export async function fetchBundles(locale: string = 'hr'): Promise<Bundle[]> {
  const res = await api.get<{ data: Bundle[] }>(`/bundles?locale=${locale}`);
  return res.data;
}

export async function fetchBundleBySlug(slug: string, locale: string = 'hr'): Promise<BundleDetail> {
  const res = await api.get<{ data: BundleDetail }>(`/bundles/${slug}?locale=${locale}`);
  return res.data;
}
