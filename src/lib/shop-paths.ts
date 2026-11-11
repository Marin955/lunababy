// Localized shop URLs. Paths here have no locale prefix (next-intl's Link adds it).
//
//   hr: /hr/paketi/            /hr/paketi/slatki-snovi/
//   en: /en/shop/              /en/shop/sweet-dreams/
//
// The app routes stay under /[locale]/shop/[slug] with the canonical (API) slug;
// next.config.ts rewrites the Croatian URLs onto them and redirects the old
// Croatian /shop URLs here. A bundle with no Croatian slug uses its canonical slug.
// Imported by next.config.ts, so it must not use the '@/...' alias.

export const HR_SHOP_SEGMENT = 'paketi';
const EN_SHOP_SEGMENT = 'shop';

/** Canonical (API) slug -> Croatian URL slug. */
export const HR_BUNDLE_SLUGS: Readonly<Record<string, string>> = {
  'first-bites': 'prvi-zalogaji',
  'first-bites-plus': 'prvi-zalogaji-plus',
  'bubbles-and-cuddles': 'mjehurici-i-mazenje',
  'sweet-dreams': 'slatki-snovi',
  'sweet-dreams-plus': 'slatki-snovi-plus',
};

/** Slugs used before the shop moved to five boxes (Nov 2026) -> current canonical slug. */
export const LEGACY_BUNDLE_SLUGS: Readonly<Record<string, string>> = {
  'feeding-bundle': 'first-bites-plus',
  'sleep-bundle': 'sweet-dreams-plus',
  'bath-time-bundle': 'bubbles-and-cuddles',
};

function shopSegment(locale: string): string {
  return locale === 'hr' ? HR_SHOP_SEGMENT : EN_SHOP_SEGMENT;
}

function urlSlug(locale: string, slug: string): string {
  return locale === 'hr' ? (HR_BUNDLE_SLUGS[slug] ?? slug) : slug;
}

/** The shop collection page, e.g. '/paketi' (hr) or '/shop' (en). */
export function shopPath(locale: string): string {
  return `/${shopSegment(locale)}`;
}

/** A bundle page from its canonical slug, e.g. '/paketi/slatki-snovi' (hr). */
export function bundlePath(locale: string, slug: string): string {
  return `/${shopSegment(locale)}/${urlSlug(locale, slug)}`;
}

/**
 * The same page in another locale, for the language switcher. Only shop paths
 * differ between locales; every other path is returned unchanged.
 */
export function translateShopPath(path: string, from: string, to: string): string {
  const match = path.match(/^\/([^/]+)(?:\/([^/]+))?\/?$/);
  if (!match || match[1] !== shopSegment(from)) return path;
  const urlSlugFrom = match[2];
  if (!urlSlugFrom) return shopPath(to);
  const canonical =
    from === 'hr'
      ? (Object.keys(HR_BUNDLE_SLUGS).find((s) => HR_BUNDLE_SLUGS[s] === urlSlugFrom) ?? urlSlugFrom)
      : urlSlugFrom;
  return bundlePath(to, canonical);
}

interface RouteRule {
  source: string;
  destination: string;
}

/** Rewrites that serve the Croatian URLs from the /[locale]/shop routes. */
export function shopRewrites(): RouteRule[] {
  return [
    { source: `/hr/${HR_SHOP_SEGMENT}`, destination: '/hr/shop' },
    ...Object.entries(HR_BUNDLE_SLUGS).map(([slug, hr]) => ({
      source: `/hr/${HR_SHOP_SEGMENT}/${hr}`,
      destination: `/hr/shop/${slug}`,
    })),
    { source: `/hr/${HR_SHOP_SEGMENT}/:slug`, destination: '/hr/shop/:slug' },
  ];
}

/** Permanent redirects from old shop URLs (old slugs, Croatian /shop URLs). */
export function shopRedirects(): (RouteRule & { permanent: true })[] {
  const rules: RouteRule[] = [
    // Old slugs, both locales, straight to the final URL.
    ...Object.entries(LEGACY_BUNDLE_SLUGS).flatMap(([legacy, slug]) => [
      { source: `/hr/shop/${legacy}`, destination: `/hr${bundlePath('hr', slug)}` },
      { source: `/hr/${HR_SHOP_SEGMENT}/${legacy}`, destination: `/hr${bundlePath('hr', slug)}` },
      { source: `/en/shop/${legacy}`, destination: `/en${bundlePath('en', slug)}` },
    ]),
    // Croatian pages under /hr/shop move to /hr/paketi with Croatian slugs.
    ...Object.entries(HR_BUNDLE_SLUGS).map(([slug, hr]) => ({
      source: `/hr/shop/${slug}`,
      destination: `/hr/${HR_SHOP_SEGMENT}/${hr}`,
    })),
    { source: '/hr/shop', destination: `/hr/${HR_SHOP_SEGMENT}` },
    { source: '/hr/shop/:slug', destination: `/hr/${HR_SHOP_SEGMENT}/:slug` },
  ];
  // Trailing slash (next.config `trailingSlash: true`) so each old URL takes one hop.
  return rules.map((r) => ({ ...r, destination: `${r.destination}/`, permanent: true as const }));
}
