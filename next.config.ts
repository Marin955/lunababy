import createNextIntlPlugin from 'next-intl/plugin';
import { shopRedirects, shopRewrites } from './src/lib/shop-paths';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig = {
  trailingSlash: true,
  images: {
    remotePatterns: [],
  },
  // Croatian shop URLs (/hr/paketi/...): see src/lib/shop-paths.ts.
  async redirects() {
    return shopRedirects();
  },
  async rewrites() {
    return shopRewrites();
  },
};

export default withNextIntl(nextConfig);
