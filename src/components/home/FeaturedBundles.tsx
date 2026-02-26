import React from 'react';
import { getTranslations } from 'next-intl/server';
import { getFeaturedBundles } from '@/services/bundle-service';
import BundleGrid from '@/components/bundles/BundleGrid';
import Button from '@/components/ui/Button';

interface FeaturedBundlesProps {
  locale: string;
}

export default async function FeaturedBundles({ locale }: FeaturedBundlesProps) {
  const t = await getTranslations('home.featured');
  const tButtons = await getTranslations('common.buttons');
  const bundles = getFeaturedBundles();

  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <div className="text-center mb-12">
        <h2 className="font-heading text-3xl sm:text-4xl font-semibold text-text-dark mb-3">
          {t('title')}
        </h2>
        <p className="text-text-mid text-lg">
          {t('subtitle')}
        </p>
      </div>

      <BundleGrid bundles={bundles} locale={locale} />

      <div className="text-center mt-10">
        <Button href="/shop" variant="outline" size="lg">
          {tButtons('viewAll')}
        </Button>
      </div>
    </section>
  );
}
