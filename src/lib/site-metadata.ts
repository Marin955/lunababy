import type { Metadata } from 'next';
import { routing } from '@/i18n/routing';

/** Canonical production origin; relative metadata URLs resolve against it. */
export const SITE_URL = 'https://www.lunababy.eu';
export const SITE_NAME = 'LunaBaby';

/** Default social share image (1200x630), built from the hero photo + logo. */
export const DEFAULT_OG_IMAGE = {
  url: '/og/default.jpg',
  width: 1200,
  height: 630,
  alt: 'LunaBaby',
} as const;

export function ogLocale(locale: string): string {
  return locale === 'en' ? 'en_US' : 'hr_HR';
}

/**
 * A page's URL path in one locale, with the trailing slash the site serves
 * (next.config `trailingSlash: true`), so canonicals never point at a redirect.
 * `path` is the path after the locale prefix, e.g. '' for the home page or '/faq'.
 */
export function localePath(locale: string, path = ''): string {
  return `/${locale}${path}/`;
}

/**
 * `alternates` for a page that exists in every locale. `path` is the path after
 * the locale prefix ('' for the home page, '/faq'), or a function giving it per
 * locale when it differs between locales (shop pages, see lib/shop-paths).
 */
export function localeAlternates(
  locale: string,
  path: string | ((locale: string) => string) = '',
): NonNullable<Metadata['alternates']> {
  const pathFor = (l: string) => localePath(l, typeof path === 'function' ? path(l) : path);
  const languages: Record<string, string> = Object.fromEntries(routing.locales.map((l) => [l, pathFor(l)]));
  languages['x-default'] = pathFor(routing.defaultLocale);
  return { canonical: pathFor(locale), languages };
}
