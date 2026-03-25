'use client';

import React, { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useCartStore } from '@/stores/cart-store';
import { fetchBundles } from '@/services/api/bundles';
import { validatePromoCode } from '@/services/api/promo-codes';
import { calculateSubtotal } from '@/services/cart-service';
import CartItem from '@/components/cart/CartItem';
import PromoCodeInput from '@/components/cart/PromoCodeInput';
import CartSummary from '@/components/cart/CartSummary';
import Button from '@/components/ui/Button';
import type { Bundle, PromoValidation } from '@/types';

export default function CartPage() {
  const t = useTranslations('cart');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const items = useCartStore((state) => state.items);
  const isHydrated = useCartStore((state) => state.isHydrated);

  const promoCode = useCartStore((state) => state.promoCode);
  const removePromo = useCartStore((state) => state.removePromo);

  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [promoValidation, setPromoValidation] = useState<PromoValidation | null>(null);

  useEffect(() => {
    if (!isHydrated) return;
    if (items.length === 0) {
      setLoading(false);
      return;
    }
    fetchBundles(locale)
      .then(setBundles)
      .catch(() => setBundles([]))
      .finally(() => setLoading(false));
  }, [isHydrated, items.length, locale]);

  const subtotal = calculateSubtotal(items, bundles);

  // Re-validate stored promo code on mount
  useEffect(() => {
    if (!promoCode || subtotal === 0) return;
    validatePromoCode(promoCode, subtotal, locale)
      .then((result) => {
        if (result.valid) {
          setPromoValidation(result);
        } else {
          removePromo();
          setPromoValidation(null);
        }
      })
      .catch(() => {
        removePromo();
        setPromoValidation(null);
      });
  }, [promoCode, subtotal, locale, removePromo]);

  // Show nothing while hydrating
  if (!isHydrated || loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="font-heading text-3xl lg:text-4xl font-semibold text-text-dark mb-8">
          {t('title')}
        </h1>
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-gray-100 rounded-[--radius-md]" />
          <div className="h-24 bg-gray-100 rounded-[--radius-md]" />
        </div>
      </div>
    );
  }

  // Empty cart state
  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="font-heading text-3xl lg:text-4xl font-semibold text-text-dark mb-8">
          {t('title')}
        </h1>
        <div className="text-center py-16">
          <div className="text-6xl mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-20 w-20 mx-auto text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
          <h2 className="font-heading text-xl font-semibold text-text-dark mb-2">
            {t('empty')}
          </h2>
          <p className="text-text-mid mb-8 max-w-md mx-auto">
            {t('emptyMessage')}
          </p>
          <Button href="/shop" variant="primary" size="lg">
            {tCommon('buttons.continueShopping')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="font-heading text-3xl lg:text-4xl font-semibold text-text-dark mb-8">
        {t('title')}
      </h1>

      {/* Free shipping note */}
      <div className="bg-teal-pale/40 border border-teal/10 rounded-[--radius-md] px-4 py-3 mb-8">
        <p className="text-sm text-teal-deep font-medium text-center">
          {t('freeShippingNote')}
        </p>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Cart items + Promo */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cart items */}
          <div className="bg-white rounded-[--radius-lg] shadow-sm p-6">
            {items.map((item) => (
              <CartItem
                key={item.bundleId}
                bundleId={item.bundleId}
                quantity={item.quantity}
                locale={locale}
                bundle={bundles.find((b) => b.id === item.bundleId)}
              />
            ))}
          </div>

          {/* Promo code */}
          <div className="bg-white rounded-[--radius-lg] shadow-sm p-6">
            <PromoCodeInput
              locale={locale}
              cartTotal={subtotal}
              onValidated={setPromoValidation}
            />
          </div>
        </div>

        {/* Right column: Summary */}
        <div className="lg:col-span-1">
          <CartSummary
            locale={locale}
            bundles={bundles}
            promoValidation={promoValidation}
          />
        </div>
      </div>
    </div>
  );
}
