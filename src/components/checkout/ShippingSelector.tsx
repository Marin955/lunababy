'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { getShippingMethods } from '@/services/shipping-service';
import { formatPrice } from '@/lib/utils';
import type { Locale } from '@/i18n/routing';

interface ShippingSelectorProps {
  selectedMethodId: string;
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
  const methods = getShippingMethods();
  const loc = locale as Locale;

  return (
    <div>
      <h2 className="font-heading text-lg font-semibold text-text-dark mb-4">
        {t('title')}
      </h2>
      <div className="space-y-3">
        {methods.map((method) => {
          const isSelected = method.id === selectedMethodId;
          const isFree =
            method.freeThreshold !== undefined &&
            subtotal >= method.freeThreshold;

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
                    {method.name[loc]}
                  </span>
                  <span className="text-sm font-semibold text-teal-deep whitespace-nowrap">
                    {isFree ? t('free') : formatPrice(method.price)}
                  </span>
                </div>
                <p className="text-sm text-text-mid mt-1">
                  {method.description[loc]}
                </p>
                <p className="text-xs text-text-light mt-1">
                  {method.carrier} &middot; {method.estimatedDays} {t('businessDays')}
                </p>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
