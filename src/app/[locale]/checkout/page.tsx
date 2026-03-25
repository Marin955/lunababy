'use client';

import React, { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useCartStore } from '@/stores/cart-store';
import { fetchBundles } from '@/services/api/bundles';
import { fetchShippingMethods } from '@/services/api/shipping';
import { validatePromoCode } from '@/services/api/promo-codes';
import { calculateSubtotal } from '@/services/cart-service';
import CheckoutForm from '@/components/checkout/CheckoutForm';
import ShippingSelector from '@/components/checkout/ShippingSelector';
import OrderSummary from '@/components/checkout/OrderSummary';
import type { Bundle, ShippingMethod, PromoValidation } from '@/types';

export default function CheckoutPage() {
  const t = useTranslations('checkout');
  const locale = useLocale();
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const promoCode = useCartStore((state) => state.promoCode);
  const isHydrated = useCartStore((state) => state.isHydrated);

  const removePromo = useCartStore((state) => state.removePromo);

  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [selectedShippingMethodId, setSelectedShippingMethodId] = useState<string | null>(null);
  const [promoValidation, setPromoValidation] = useState<PromoValidation | null>(null);
  const [loading, setLoading] = useState(true);
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Redirect to shop if cart is empty (but not after placing an order)
  useEffect(() => {
    if (isHydrated && items.length === 0 && !orderPlaced) {
      router.replace('/shop');
    }
  }, [isHydrated, items.length, router, orderPlaced]);

  // Fetch bundles and shipping methods
  useEffect(() => {
    if (!isHydrated || items.length === 0) return;
    Promise.all([
      fetchBundles(locale),
      fetchShippingMethods(locale),
    ])
      .then(([bundleData, shippingData]) => {
        setBundles(bundleData);
        setShippingMethods(shippingData);
        if (shippingData.length > 0) {
          setSelectedShippingMethodId(shippingData[0].id);
        }
      })
      .catch(() => {})
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

  // Loading state while hydrating
  if (!isHydrated || loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="font-heading text-3xl lg:text-4xl font-semibold text-text-dark mb-8">
          {t('title')}
        </h1>
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-gray-100 rounded-[--radius-md]" />
          <div className="h-48 bg-gray-100 rounded-[--radius-md]" />
        </div>
      </div>
    );
  }

  // Don't render if cart is empty (will redirect)
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="font-heading text-3xl lg:text-4xl font-semibold text-text-dark mb-8">
        {t('title')}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Form + Shipping */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[--radius-lg] shadow-sm p-6">
            <CheckoutForm
              locale={locale}
              items={items}
              bundles={bundles}
              shippingMethodId={selectedShippingMethodId}
              promoCode={promoCode}
              onOrderPlaced={() => setOrderPlaced(true)}
            />
          </div>

          <div className="bg-white rounded-[--radius-lg] shadow-sm p-6">
            <ShippingSelector
              selectedMethodId={selectedShippingMethodId}
              onSelect={setSelectedShippingMethodId}
              locale={locale}
              subtotal={subtotal}
            />
          </div>
        </div>

        {/* Right column: Order Summary */}
        <div className="lg:col-span-1">
          <OrderSummary
            locale={locale}
            bundles={bundles}
            shippingMethods={shippingMethods}
            selectedShippingMethodId={selectedShippingMethodId}
            promoValidation={promoValidation}
          />
        </div>
      </div>
    </div>
  );
}
