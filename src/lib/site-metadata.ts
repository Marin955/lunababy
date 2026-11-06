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
 * `alternates` for a page that exists in every locale. `path` is the path after
 * the locale prefix, e.g. '' for the home page or '/shop/sleep-bundle'.
 */
export function localeAlternates(locale: string, path = ''): NonNullable<Metadata['alternates']> {
  const languages: Record<string, string> = Object.fromEntries(
    routing.locales.map((l) => [l, `/${l}${path}`]),
  );
  languages['x-default'] = `/${routing.defaultLocale}${path}`;
  return { canonical: `/${locale}${path}`, languages };
}
