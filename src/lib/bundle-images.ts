// Static image mapping for bundles that have product photos
// Key is the bundle slug, value is the path relative to /public
const bundleImages: Record<string, string> = {
  'sleep-bundle': '/images/sleeping-box.jpg',
  'bath-time-bundle': '/images/bath-box.jpg',
};

export function getBundleImage(slug: string): string | null {
  return bundleImages[slug] ?? null;
}
