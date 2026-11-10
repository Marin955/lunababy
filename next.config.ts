import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

// Bundle slugs renamed when the shop moved to five boxes (Nov 2026).
const RENAMED_BUNDLE_SLUGS: Record<string, string> = {
  'feeding-bundle': 'first-bites-plus',
  'sleep-bundle': 'sweet-dreams-plus',
  'bath-time-bundle': 'bubbles-and-cuddles',
};

const nextConfig = {
  trailingSlash: true,
  images: {
    remotePatterns: [],
  },
  async redirects() {
    return Object.entries(RENAMED_BUNDLE_SLUGS).map(([from, to]) => ({
      source: `/:locale(hr|en)/shop/${from}`,
      destination: `/:locale/shop/${to}`,
      permanent: true,
    }));
  },
};

export default withNextIntl(nextConfig);
