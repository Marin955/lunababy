// Box photos for each bundle. Keys are bundle slugs, paths are relative to /public.
// All photos are 4:3 (1446x1087).

const bundleImages: Record<string, string> = {
  'first-bites': '/images/bundles/feeding-box.jpg',
  'first-bites-plus': '/images/bundles/feeding-box-large.jpg',
  'bubbles-and-cuddles': '/images/bundles/bath-box.jpg',
  'sweet-dreams': '/images/bundles/sleep-box.jpg',
  'sweet-dreams-plus': '/images/bundles/sleep-box-large.jpg',
};

/** The bundle's box photo, or null if there isn't one. */
export function getBundleImage(slug: string): string | null {
  return bundleImages[slug] ?? null;
}

/** One photo for small thumbnails (cart line, mini-cart). */
export function getBundleThumbnail(slug: string): string | null {
  return getBundleImage(slug);
}
