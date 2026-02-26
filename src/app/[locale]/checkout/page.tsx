'use client';

import React, { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useCartStore } from '@/stores/cart-store';
import CheckoutForm from '@/components/checkout/CheckoutForm';
import ShippingSelector from '@/components/checkout/ShippingSelector';
import OrderSummary from '@/components/checkout/OrderSummary';
import { getBundles } from '@/services/bundle-service';
import { calculateSubtotal } from '@/services/cart-service';
import type { CheckoutFormValues } from '@/components/checkout/CheckoutForm';

export default function CheckoutPage() {
  const t = useTranslations('checkout');
  const locale = useLocale();
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const isHydrated = useCartStore((state) => state.isHydrated);

  const [selectedShippingMethod, setSelectedShippingMethod] = useState('standard');

  // Redirect to shop if cart is empty
  useEffect(() => {
    if (isHydrated && items.length === 0) {
      router.replace('/shop');
    }
  }, [isHydrated, items.length, router]);

  // Calculate subtotal for shipping selector
  const bundles = getBundles();
  const subtotal = calculateSubtotal(items, bundles);

  function handleFormSubmit(_data: CheckoutFormValues) {
    router.push('/order-confirmation');
  }

  // Loading state while hydrating
  if (!isHydrated) {
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
            <CheckoutForm onSubmit={handleFormSubmit} />
          </div>

          <div className="bg-white rounded-[--radius-lg] shadow-sm p-6">
            <ShippingSelector
              selectedMethodId={selectedShippingMethod}
              onSelect={setSelectedShippingMethod}
              locale={locale}
              subtotal={subtotal}
            />
          </div>
        </div>

        {/* Right column: Order Summary */}
        <div className="lg:col-span-1">
          <OrderSummary
            shippingMethodId={selectedShippingMethod}
            locale={locale}
          />
        </div>
      </div>
    </div>
  );
}
