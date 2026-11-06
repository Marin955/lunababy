// Static imagery for bundles. Keys are bundle slugs, paths are relative to /public.
//
// Box photos: a real photo of the packed bundle box. Preferred everywhere.
// Collages: real product photos of the bundle's items, shown as a 2x2 grid when
// there is no box photo yet.
//
// Owner input O4: the feeding bundle has no box photo yet. When
// public/images/feeding-box.jpg (>= 2000px long side) is delivered, set
// HAS_FEEDING_BOX_PHOTO to true and the collage stops being used.
// Owner input O5: sleeping-box.jpg / bath-box.jpg are 1024-1210px wide; replace
// them in place with >= 2000px originals when they arrive (no code change needed).
const HAS_FEEDING_BOX_PHOTO = false;

const bundleImages: Record<string, string> = {
  'sleep-bundle': '/images/sleeping-box.jpg',
  'bath-time-bundle': '/images/bath-box.jpg',
  ...(HAS_FEEDING_BOX_PHOTO ? { 'feeding-bundle': '/images/feeding-box.jpg' } : {}),
};

const bundleCollages: Record<string, readonly string[]> = {
  'feeding-bundle': [
    '/images/products/baby-bottle.jpg',
    '/images/products/silicone-bowl.jpg',
    '/images/products/fork-and-spoon.jpg',
    '/images/products/three-compartment-container.jpg',
  ],
};

/** The bundle's box photo, or null if there isn't one. */
export function getBundleImage(slug: string): string | null {
  return bundleImages[slug] ?? null;
}

/** Product photos for a 2x2 collage, used only when there is no box photo. */
export function getBundleCollage(slug: string): readonly string[] | null {
  if (bundleImages[slug]) return null;
  return bundleCollages[slug] ?? null;
}

/** One photo for small thumbnails (cart line, mini-cart): box photo, else the first collage photo. */
export function getBundleThumbnail(slug: string): string | null {
  return getBundleImage(slug) ?? bundleCollages[slug]?.[0] ?? null;
}
