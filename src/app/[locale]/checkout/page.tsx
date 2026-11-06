'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useCartStore } from '@/stores/cart-store';
import { fetchBundles } from '@/services/api/bundles';
import { fetchShippingMethods } from '@/services/api/shipping';
import { validatePromoCode } from '@/services/api/promo-codes';
import { abandonOrder } from '@/services/api/orders';
import { calculateSubtotal } from '@/services/cart-service';
import CheckoutForm from '@/components/checkout/CheckoutForm';
import OrderSummary, { computeCheckoutTotals } from '@/components/checkout/OrderSummary';
import type { Bundle, ShippingMethod, PromoValidation } from '@/types';

export default function CheckoutPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const t = useTranslations('checkout');
  const searchParams = useSearchParams();
  const cancelledOrderId = searchParams.get('cancelled_order');
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
      router.replace('/');
    }
  }, [isHydrated, items.length, router, orderPlaced]);

  // Back from Stripe without paying: release the reserved stock right away
  // (the cart is still intact because it is only cleared after payment).
  useEffect(() => {
    if (cancelledOrderId) abandonOrder(cancelledOrderId).catch(() => {});
  }, [cancelledOrderId]);

  // Fetch bundles and shipping methods once; the form and summary share them.
  useEffect(() => {
    if (!isHydrated || items.length === 0) return;
    Promise.all([
      fetchBundles(locale),
      fetchShippingMethods(locale),
    ])
      .then(([bundleData, shippingData]) => {
        setBundles(bundleData);
        setShippingMethods(shippingData);
        setSelectedShippingMethodId((current) =>
          current && shippingData.some((m) => m.id === current) ? current : shippingData[0]?.id ?? null
        );
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isHydrated, items.length, locale]);

  const subtotal = calculateSubtotal(items, bundles);
  const totals = computeCheckoutTotals(items, bundles, shippingMethods, selectedShippingMethodId, promoValidation);
  const freeShippingPromo = Boolean(promoValidation?.valid && promoValidation.discount_type === 'free_shipping');

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
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:py-12">
        <h1 className="font-heading text-3xl lg:text-4xl font-semibold text-text-dark mb-6 lg:mb-8">
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
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:py-12">
      <h1 className="font-heading text-3xl lg:text-4xl font-semibold text-text-dark mb-6 lg:mb-8">
        {t('title')}
      </h1>

      {cancelledOrderId && (
        <div role="status" className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-[--radius-md] text-sm text-amber-900">
          {t('paymentCancelled')}
        </div>
      )}

      {/* Mobile: collapsible summary with the total, above the form */}
      <div className="mb-6 lg:hidden">
        <OrderSummary locale={locale} items={items} bundles={bundles} totals={totals} variant="collapsible" />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left column: the steps, ending with the submit button */}
        <div className="lg:col-span-2">
          <CheckoutForm
            locale={locale}
            items={items}
            shippingMethods={shippingMethods}
            selectedShippingMethodId={selectedShippingMethodId}
            onSelectShippingMethod={setSelectedShippingMethodId}
            subtotal={subtotal}
            freeShippingPromo={freeShippingPromo}
            promoCode={promoCode}
            onOrderPlaced={() => setOrderPlaced(true)}
          />
        </div>

        {/* Right column (desktop): sticky order summary */}
        <aside className="hidden lg:col-span-1 lg:block">
          <OrderSummary locale={locale} items={items} bundles={bundles} totals={totals} />
        </aside>
      </div>
    </div>
  );
}
