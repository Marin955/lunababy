'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useCartStore } from '@/stores/cart-store';
import { getBundles } from '@/services/bundle-service';
import { getShippingMethods } from '@/services/shipping-service';
import {
  calculateSubtotal,
  calculateDiscount,
  calculateShipping,
  calculateTotal,
  validatePromoCode,
} from '@/services/cart-service';
import { formatPrice } from '@/lib/utils';
import type { Locale } from '@/i18n/routing';

interface OrderSummaryProps {
  shippingMethodId: string | null;
  locale: string;
}

export default function OrderSummary({ shippingMethodId, locale }: OrderSummaryProps) {
  const t = useTranslations('checkout');
  const tCart = useTranslations('cart');
  const items = useCartStore((state) => state.items);
  const promoCode = useCartStore((state) => state.promoCode);

  const bundles = getBundles();
  const loc = locale as Locale;

  const subtotal = calculateSubtotal(items, bundles);

  const promo = promoCode ? validatePromoCode(promoCode) : null;
  const discount = calculateDiscount(subtotal, promo);

  const shippingMethods = getShippingMethods();
  const selectedMethod = shippingMethodId
    ? shippingMethods.find((m) => m.id === shippingMethodId) ?? null
    : null;

  const shipping = selectedMethod
    ? calculateShipping(subtotal, selectedMethod, promo)
    : 0;

  const total = calculateTotal(subtotal, discount, shipping);

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
                {bundle.name[loc]} &times; {item.quantity}
              </span>
              <span className="text-text-dark font-medium">
                {formatPrice(lineTotal)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="border-t border-gray-100 pt-4 space-y-3">
        {/* Subtotal */}
        <div className="flex justify-between text-sm">
          <span className="text-text-mid">{tCart('subtotal')}</span>
          <span className="text-text-dark">{formatPrice(subtotal)}</span>
        </div>

        {/* Discount */}
        {discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-green-600">{tCart('discount')}</span>
            <span className="text-green-600 font-medium">
              -{formatPrice(discount)}
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
                : formatPrice(shipping)
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
            {formatPrice(total)}
          </span>
        </div>
      </div>
    </div>
  );
}
