'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import type { AdminLowStockBundle } from '@/types';

interface LowStockAlertsProps {
  bundles: AdminLowStockBundle[];
}

export default function LowStockAlerts({ bundles }: LowStockAlertsProps) {
  const t = useTranslations('admin.dashboard');

  if (bundles.length === 0) return null;

  return (
    <div className="bg-white rounded-[--radius-md] shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="font-semibold text-text-dark">{t('lowStock')}</h3>
      </div>
      <div className="p-4 space-y-2">
        {bundles.map((bundle) => (
          <div key={bundle.id} className="flex items-center justify-between text-sm p-2 bg-red-50 rounded-[--radius-sm]">
            <span className="text-text-dark font-medium">{bundle.name_hr}</span>
            <span className="text-red-600 font-semibold">
              {bundle.stock_quantity} / {bundle.low_stock_threshold}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
