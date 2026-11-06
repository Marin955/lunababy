import React from 'react';
import { useTranslations } from 'next-intl';

/** At or below this many bundles we say "only N left". Bundles have no own threshold field. */
export const LOW_STOCK_THRESHOLD = 5;

interface StockStatusProps {
  inStock: boolean;
  stockQuantity: number;
}

export default function StockStatus({ inStock, stockQuantity }: StockStatusProps) {
  const t = useTranslations('bundle.stock');

  const available = inStock && stockQuantity > 0;
  const low = available && stockQuantity <= LOW_STOCK_THRESHOLD;

  const tone = !available
    ? { dot: 'bg-red-500', text: 'text-red-700' }
    : low
      ? { dot: 'bg-amber-500', text: 'text-amber-800' }
      : { dot: 'bg-green-600', text: 'text-green-800' };

  return (
    <p className={`flex items-center gap-2 text-sm font-semibold ${tone.text}`}>
      <span aria-hidden="true" className={`inline-block w-2.5 h-2.5 rounded-full ${tone.dot}`} />
      {!available ? t('unavailable') : low ? t('lowStock', { count: stockQuantity }) : t('inStock')}
    </p>
  );
}
