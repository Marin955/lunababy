'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import type { AdminLowStockProduct } from '@/types';

interface LowStockAlertsProps {
  products: AdminLowStockProduct[];
}

export default function LowStockAlerts({ products }: LowStockAlertsProps) {
  const t = useTranslations('admin.dashboard');

  if (products.length === 0) return null;

  return (
    <div className="bg-white rounded-[--radius-md] shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="font-semibold text-text-dark">{t('lowStock')}</h3>
      </div>
      <div className="p-4 space-y-2">
        {products.map((product) => (
          <div key={product.id} className="flex items-center justify-between text-sm p-2 bg-red-50 rounded-[--radius-sm]">
            <div>
              <span className="text-text-dark font-medium">{product.name_hr}</span>
              {product.bundles.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {product.bundles.map((bundleName) => (
                    <span key={bundleName} className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-700">
                      {bundleName}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <span className="text-red-600 font-semibold whitespace-nowrap ml-3">
              {product.stock_quantity} / {product.low_stock_threshold}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
