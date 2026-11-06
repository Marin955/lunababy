// Plain (non-client) helpers for the product page. Kept out of the 'use client' components
// so server components can call them.
import type { BundleDetail, BundleItem } from '@/types';

/** Same per-line cap as the cart store. */
export const MAX_QUANTITY_PER_LINE = 10;

export interface GallerySlide {
  type: 'bundle' | 'product';
  src: string;
  alt: string;
}

/** Bundle photo first (when there is one), then every product photo, with the item name as alt text. */
export function buildSlides(bundleImage: string | null, bundleName: string, items: BundleItem[]): GallerySlide[] {
  const slides: GallerySlide[] = [];
  if (bundleImage) slides.push({ type: 'bundle', src: bundleImage, alt: bundleName });
  for (const item of items) {
    if (item.image_path) slides.push({ type: 'product', src: item.image_path, alt: item.name });
  }
  return slides;
}

/** Public site origin, used for absolute URLs in metadata and structured data. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.lunababy.eu').replace(/\/$/, '');

export function absoluteUrl(path: string): string {
  return /^https?:\/\//.test(path) ? path : `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

/** Cents → schema.org decimal string ("8990" → "89.90"). */
export function centsToDecimal(cents: number): string {
  return (cents / 100).toFixed(2);
}

/**
 * schema.org Product for a bundle page.
 *
 * No aggregateRating / review here: WS-F (verified-purchase reviews) passes them through
 * `extra` only when at least one approved review exists.
 */
export function buildProductJsonLd(
  bundle: BundleDetail,
  options: { url: string; images: string[]; extra?: Record<string, unknown> }
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: bundle.name,
    description: bundle.description || bundle.short_description,
    image: options.images.map(absoluteUrl),
    sku: bundle.slug,
    brand: { '@type': 'Brand', name: 'LunaBaby' },
    offers: {
      '@type': 'Offer',
      url: absoluteUrl(options.url),
      price: centsToDecimal(bundle.price),
      priceCurrency: 'EUR',
      availability: bundle.in_stock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
    ...options.extra,
  };
}

/** Serializes JSON-LD for a <script> tag, escaping "<" so the payload can't close the tag. */
export function serializeJsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
