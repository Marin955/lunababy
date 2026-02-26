import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { getBundles } from '@/services/bundle-service';
import BundleGrid from '@/components/bundles/BundleGrid';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.shop' });

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

export default async function ShopPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('shop');
  const bundles = getBundles();

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="font-heading text-3xl sm:text-4xl font-semibold text-text-dark mb-3">
          {t('title')}
        </h1>
        <p className="text-text-mid text-lg">
          {t('subtitle')}
        </p>
      </div>

      <BundleGrid bundles={bundles} locale={locale} />
    </div>
  );
}
