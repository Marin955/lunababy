'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { fetchShippingMethods } from '@/services/api/shipping';
import { formatPrice } from '@/lib/utils';
import type { ShippingMethod } from '@/types';

interface ShippingSelectorProps {
  selectedMethodId: string | null;
  onSelect: (methodId: string) => void;
  locale: string;
  subtotal: number;
}

export default function ShippingSelector({
  selectedMethodId,
  onSelect,
  locale,
  subtotal,
}: ShippingSelectorProps) {
  const t = useTranslations('checkout.shipping');
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShippingMethods(locale)
      .then((data) => {
        setMethods(data);
        if (data.length > 0 && !selectedMethodId) {
          onSelect(data[0].id);
        }
      })
      .catch(() => setMethods([]))
      .finally(() => setLoading(false));
  }, [locale]);

  if (loading) {
    return (
      <div>
        <h2 className="font-heading text-lg font-semibold text-text-dark mb-4">
          {t('title')}
        </h2>
        <div className="animate-pulse space-y-3">
          <div className="h-20 bg-gray-100 rounded-[--radius-md]" />
          <div className="h-20 bg-gray-100 rounded-[--radius-md]" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-heading text-lg font-semibold text-text-dark mb-4">
        {t('title')}
      </h2>
      <div className="space-y-3">
        {methods.map((method) => {
          const isSelected = method.id === selectedMethodId;
          const isFree =
            method.free_threshold !== null && subtotal >= method.free_threshold;

          return (
            <label
              key={method.id}
              className={`
                flex items-start gap-4 p-4 rounded-[--radius-md] border-2 cursor-pointer
                transition-all duration-200
                ${isSelected
                  ? 'border-teal bg-teal-pale/30'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
                }
              `}
            >
              <input
                type="radio"
                name="shipping-method"
                value={method.id}
                checked={isSelected}
                onChange={() => onSelect(method.id)}
                className="mt-1 accent-teal-deep"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-text-dark">
                    {method.name}
                  </span>
                  <span className="text-sm font-semibold text-teal-deep whitespace-nowrap">
                    {isFree ? t('free') : formatPrice(method.price, locale)}
                  </span>
                </div>
                <p className="text-sm text-text-mid mt-1">
                  {method.description}
                </p>
                <p className="text-xs text-text-light mt-1">
                  {method.carrier} &middot; {method.estimated_days} {t('businessDays')}
                </p>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
