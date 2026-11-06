'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { formatPrice } from '@/lib/utils';
import { deliveryDaysUpperBound, formatDayRange } from './delivery-time';
import type { ShippingMethod } from '@/types';

interface ShippingSelectorProps {
  methods: ShippingMethod[];
  selectedMethodId: string | null;
  onSelect: (methodId: string) => void;
  locale: string;
  /** Subtotal after bundle discounts, before promo: what free_threshold is compared to. */
  subtotal: number;
  /** All shipping is free (free-shipping promo code). */
  freeShippingPromo?: boolean;
  /** DOM id prefix; the first radio gets `${idPrefix}-0`. */
  idPrefix: string;
}

export default function ShippingSelector({
  methods,
  selectedMethodId,
  onSelect,
  locale,
  subtotal,
  freeShippingPromo = false,
  idPrefix,
}: ShippingSelectorProps) {
  const t = useTranslations('checkout.shipping');

  if (methods.length === 0) {
    return <p className="text-sm text-text-mid">{t('unavailable')}</p>;
  }

  return (
    <div className="space-y-3">
      {methods.map((method, index) => {
        const isSelected = method.id === selectedMethodId;
        const isFree =
          freeShippingPromo || (method.free_threshold !== null && subtotal >= method.free_threshold);
        const upper = deliveryDaysUpperBound(method.estimated_days);

        return (
          <label
            key={method.id}
            htmlFor={`${idPrefix}-${index}`}
            className={`flex cursor-pointer items-start gap-4 rounded-[--radius-md] border-2 p-4 transition-colors duration-200 ${
              isSelected ? 'border-teal bg-teal-pale/40' : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <input
              id={`${idPrefix}-${index}`}
              type="radio"
              name="shipping-method"
              value={method.id}
              checked={isSelected}
              onChange={() => onSelect(method.id)}
              className="mt-1 h-4 w-4 shrink-0 accent-teal-deep"
            />
            <span className="min-w-0 flex-1">
              <span className="flex items-start justify-between gap-2">
                <span className="font-semibold text-text-dark">{method.name}</span>
                <span className="whitespace-nowrap text-sm font-semibold text-text-dark tabular-nums">
                  {isFree ? t('free') : formatPrice(method.price, locale)}
                </span>
              </span>
              <span className="mt-1 block text-sm text-text-mid">{method.description}</span>
              <span className="mt-1 block text-sm text-text-mid">
                {method.carrier}
                {upper !== null && (
                  <>
                    {' · '}
                    {t('deliveryTime', { range: formatDayRange(method.estimated_days), upper })}
                  </>
                )}
              </span>
            </span>
          </label>
        );
      })}
    </div>
  );
}
