import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import HeroSection from '@/components/home/HeroSection';
import Categories from '@/components/home/Categories';
import FeaturedBundles from '@/components/home/FeaturedBundles';
import WhyLunaBaby from '@/components/home/WhyLunaBaby';
import Newsletter from '@/components/home/Newsletter';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.home' });

  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      siteName: 'LunaBaby',
      locale: locale === 'hr' ? 'hr_HR' : 'en_US',
      type: 'website',
    },
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <HeroSection />
      <Categories />
      <FeaturedBundles locale={locale} />
      <WhyLunaBaby />
      <Newsletter />
    </>
  );
}
