import React from 'react';
import type { Bundle } from '@/types';
import BundleCard from '@/components/bundles/BundleCard';

interface BundleGridProps {
  bundles: Bundle[];
  locale: string;
}

export default function BundleGrid({ bundles, locale }: BundleGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {bundles.map((bundle) => (
        <BundleCard key={bundle.id} bundle={bundle} locale={locale} />
      ))}
    </div>
  );
}
