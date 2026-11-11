import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { SITE_URL, localePath } from '@/lib/site-metadata';
import { bundlePath, shopPath } from '@/lib/shop-paths';
import { getBundles } from '@/services/bundle-service';

// Rebuilt at most hourly, so new or renamed bundles show up without a deploy.
export const revalidate = 3600;

// Public pages that exist in every locale. /terms is left out while it is noindex
// (TERMS_NOINDEX); add it back when the terms are approved.
const STATIC_PAGES: ((locale: string) => string)[] = [
  () => '',
  shopPath,
  () => '/about',
  () => '/faq',
  () => '/contact',
  () => '/shipping-info',
  () => '/returns',
  () => '/privacy',
];

/** One entry per locale, each listing every language version of the page. */
function entries(pathFor: (locale: string) => string): MetadataRoute.Sitemap {
  const url = (locale: string) => `${SITE_URL}${localePath(locale, pathFor(locale))}`;
  const languages = Object.fromEntries(routing.locales.map((l) => [l, url(l)]));
  return routing.locales.map((locale) => ({ url: url(locale), alternates: { languages } }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let slugs: string[] = [];
  try {
    slugs = (await getBundles(routing.defaultLocale)).map((b) => b.slug);
  } catch {
    // API unreachable: still serve the static pages rather than an error.
  }

  return [
    ...STATIC_PAGES.flatMap(entries),
    ...slugs.flatMap((slug) => entries((locale) => bundlePath(locale, slug))),
  ];
}
