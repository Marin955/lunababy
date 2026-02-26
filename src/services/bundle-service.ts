import type { Bundle } from '@/types';
import { bundles } from '@/data/bundles';

export function getBundles(): Bundle[] {
  return bundles;
}

export function getBundleBySlug(slug: string): Bundle | null {
  return bundles.find((bundle) => bundle.slug === slug) ?? null;
}

export function getFeaturedBundles(): Bundle[] {
  return bundles.filter(
    (bundle) => bundle.badge === 'popular' || bundle.badge === 'new'
  );
}
