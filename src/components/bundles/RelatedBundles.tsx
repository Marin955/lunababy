import React from 'react';
import { getTranslations } from 'next-intl/server';
import { getBundles } from '@/services/bundle-service';
import BundleCard from '@/components/bundles/BundleCard';

interface RelatedBundlesProps {
  currentBundleId: string;
  locale: string;
}

/** "See our other bundles": every other active bundle. Renders nothing if there are none or the API fails. */
export default async function RelatedBundles({ currentBundleId, locale }: RelatedBundlesProps) {
  let bundles;
  try {
    bundles = (await getBundles(locale)).filter((b) => b.id !== currentBundleId);
  } catch {
    return null;
  }
  if (bundles.length === 0) return null;

  const t = await getTranslations({ locale, namespace: 'bundle.related' });

  return (
    <section aria-labelledby="related-bundles-title" className="mt-20">
      <h2 id="related-bundles-title" className="font-heading text-2xl sm:text-3xl font-semibold text-text-dark mb-8">
        {t('title')}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bundles.map((bundle) => (
          <BundleCard key={bundle.id} bundle={bundle} locale={locale} />
        ))}
      </div>
    </section>
  );
}
