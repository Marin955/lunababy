import type { Bundle, BundleDetail } from '@/types';
import { fetchBundles, fetchBundleBySlug } from './api/bundles';

export async function getBundles(locale: string = 'hr'): Promise<Bundle[]> {
  return fetchBundles(locale);
}

export async function getBundleBySlug(slug: string, locale: string = 'hr'): Promise<BundleDetail | null> {
  try {
    return await fetchBundleBySlug(slug, locale);
  } catch {
    return null;
  }
}

export async function getFeaturedBundles(locale: string = 'hr'): Promise<Bundle[]> {
  return fetchBundles(locale);
}
