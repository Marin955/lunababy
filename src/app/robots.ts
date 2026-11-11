import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { SITE_URL } from '@/lib/site-metadata';

// Account, cart and checkout pages have nothing for search results.
const PRIVATE_PATHS = [
  'admin',
  'cart',
  'checkout',
  'order-confirmation',
  'order-lookup',
  'profile',
  'review',
  'signin',
  'register',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: routing.locales.flatMap((locale) => PRIVATE_PATHS.map((path) => `/${locale}/${path}/`)),
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
