'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useCartStore } from '@/stores/cart-store';
import {
  calculateSubtotal,
  calculateDiscount,
  calculateShipping,
  calculateTotal,
} from '@/services/cart-service';
import { formatPrice } from '@/lib/utils';
import type { Bundle, ShippingMethod, PromoValidation } from '@/types';

interface OrderSummaryProps {
  locale: string;
  bundles: Bundle[];
  shippingMethods: ShippingMethod[];
  selectedShippingMethodId: string | null;
  promoValidation: PromoValidation | null;
}

export default function OrderSummary({
  locale,
  bundles,
  shippingMethods,
  selectedShippingMethodId,
  promoValidation,
}: OrderSummaryProps) {
  const t = useTranslations('checkout');
  const tCart = useTranslations('cart');
  const items = useCartStore((state) => state.items);

  const subtotal = calculateSubtotal(items, bundles);
  const promoDiscount = calculateDiscount(subtotal, promoValidation);

  // Calculate savings from bundle discounts (original_price vs price)
  const bundleSavings = items.reduce((sum, item) => {
    const bundle = bundles.find((b) => b.id === item.bundleId);
    if (bundle?.original_price) {
      return sum + (bundle.original_price - bundle.price) * item.quantity;
    }
    return sum;
  }, 0);

  const fullPrice = subtotal + bundleSavings;

  const selectedMethod = selectedShippingMethodId
    ? shippingMethods.find((m) => m.id === selectedShippingMethodId) ?? null
    : null;

  const shipping = selectedMethod
    ? calculateShipping(subtotal, selectedMethod, promoValidation)
    : 0;

  const total = calculateTotal(subtotal, promoDiscount, shipping);

  return (
    <div className="bg-white rounded-[--radius-lg] shadow-sm p-6 sticky top-24">
      <h2 className="font-heading text-lg font-semibold text-text-dark mb-6">
        {t('orderSummary')}
      </h2>

      {/* Item list */}
      <div className="space-y-3 mb-6">
        {items.map((item) => {
          const bundle = bundles.find((b) => b.id === item.bundleId);
          if (!bundle) return null;
          const lineTotal = bundle.price * item.quantity;

          return (
            <div key={item.bundleId} className="flex justify-between text-sm">
              <span className="text-text-mid">
                {bundle.name} &times; {item.quantity}
              </span>
              <span className="text-text-dark font-medium">
                {formatPrice(lineTotal, locale)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="border-t border-gray-100 pt-4 space-y-3">
        {/* Full price (before discounts) */}
        <div className="flex justify-between text-sm">
          <span className="text-text-mid">{tCart('subtotal')}</span>
          <span className="text-text-dark">{formatPrice(fullPrice, locale)}</span>
        </div>

        {/* Bundle discount savings */}
        {bundleSavings > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-text-mid">{tCart('savings')}</span>
            <span className="text-text-dark font-medium">
              -{formatPrice(bundleSavings, locale)}
            </span>
          </div>
        )}

        {/* Promo code discount */}
        {promoDiscount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-teal-deep">{tCart('discount')}</span>
            <span className="text-teal-deep font-medium">
              -{formatPrice(promoDiscount, locale)}
            </span>
          </div>
        )}

        {/* Shipping */}
        <div className="flex justify-between text-sm">
          <span className="text-text-mid">{tCart('shipping')}</span>
          <span className="text-text-dark">
            {selectedMethod
              ? shipping === 0
                ? t('shipping.free')
                : formatPrice(shipping, locale)
              : tCart('shippingAtCheckout')}
          </span>
        </div>
      </div>

      {/* Total */}
      <div className="border-t border-gray-200 mt-4 pt-4">
        <div className="flex justify-between">
          <span className="font-heading font-semibold text-text-dark">
            {tCart('total')}
          </span>
          <span className="font-heading text-xl font-bold text-teal-deep">
            {formatPrice(total, locale)}
          </span>
        </div>
      </div>
    </div>
  );
}
