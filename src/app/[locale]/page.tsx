import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import HeroSection from '@/components/home/HeroSection';
import FeaturedBundles from '@/components/home/FeaturedBundles';
import WhyLunaBaby from '@/components/home/WhyLunaBaby';
import Newsletter from '@/components/home/Newsletter';
import { getFeaturedBundles } from '@/services/bundle-service';
import { DEFAULT_OG_IMAGE, SITE_NAME, localeAlternates, ogLocale } from '@/lib/site-metadata';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.home' });

  return {
    title: t('title'),
    description: t('description'),
    alternates: localeAlternates(locale),
    openGraph: {
      title: t('title'),
      description: t('description'),
      siteName: SITE_NAME,
      locale: ogLocale(locale),
      type: 'website',
      url: `/${locale}`,
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      images: [DEFAULT_OG_IMAGE.url],
    },
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const bundles = await getFeaturedBundles(locale);

  return (
    <>
      <HeroSection />
      <FeaturedBundles bundles={bundles} locale={locale} />
      <WhyLunaBaby />
      <Newsletter />
    </>
  );
}
