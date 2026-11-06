import React from 'react';
import { useTranslations } from 'next-intl';
import type { BundleItem } from '@/types';

interface ProductSpecsProps {
  item: BundleItem;
}

/** True when the item has at least one spec value to show. */
export function hasSpecs(item: BundleItem): boolean {
  return Boolean(
    item.brand || item.material || item.dimensions || item.age_range || item.care_instructions || item.certifications?.length
  );
}

/** Spec table for one bundle item. Only rows with values are rendered; renders nothing when all are empty. */
export default function ProductSpecs({ item }: ProductSpecsProps) {
  const t = useTranslations('bundle.specs');

  const rows: { label: string; value: string }[] = [
    { label: t('brand'), value: item.brand },
    { label: t('material'), value: item.material },
    { label: t('dimensions'), value: item.dimensions },
    { label: t('ageRange'), value: item.age_range },
    { label: t('certifications'), value: item.certifications?.length ? item.certifications.join(', ') : null },
    { label: t('care'), value: item.care_instructions },
  ].filter((row): row is { label: string; value: string } => Boolean(row.value));

  if (rows.length === 0) return null;

  return (
    <dl className="grid grid-cols-[minmax(7rem,auto)_1fr] gap-x-4 gap-y-2 text-sm">
      {rows.map((row) => (
        <React.Fragment key={row.label}>
          <dt className="text-text-mid">{row.label}</dt>
          <dd className="text-text-dark whitespace-pre-line">{row.value}</dd>
        </React.Fragment>
      ))}
    </dl>
  );
}
