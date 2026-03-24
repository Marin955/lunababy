import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig = {
  trailingSlash: true,
  images: {
    remotePatterns: [],
  },
};

export default withNextIntl(nextConfig);
