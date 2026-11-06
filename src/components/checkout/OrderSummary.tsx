'use client';

import React, { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  calculateSubtotal,
  calculateDiscount,
  calculateShipping,
  calculateTotal,
} from '@/services/cart-service';
import { formatPrice } from '@/lib/utils';
import type { Bundle, CartItem, ShippingMethod, PromoValidation } from '@/types';

export interface CheckoutTotals {
  subtotal: number;
  fullPrice: number;
  bundleSavings: number;
  promoDiscount: number;
  shipping: number;
  total: number;
  selectedMethod: ShippingMethod | null;
}

export function computeCheckoutTotals(
  items: CartItem[],
  bundles: Bundle[],
  shippingMethods: ShippingMethod[],
  selectedShippingMethodId: string | null,
  promoValidation: PromoValidation | null
): CheckoutTotals {
  const subtotal = calculateSubtotal(items, bundles);
  const promoDiscount = calculateDiscount(subtotal, promoValidation);
  const bundleSavings = items.reduce((sum, item) => {
    const bundle = bundles.find((b) => b.id === item.bundleId);
    return bundle?.original_price ? sum + (bundle.original_price - bundle.price) * item.quantity : sum;
  }, 0);
  const selectedMethod = shippingMethods.find((m) => m.id === selectedShippingMethodId) ?? null;
  const shipping = selectedMethod ? calculateShipping(subtotal, selectedMethod, promoValidation) : 0;

  return {
    subtotal,
    fullPrice: subtotal + bundleSavings,
    bundleSavings,
    promoDiscount,
    shipping,
    total: calculateTotal(subtotal, promoDiscount, shipping),
    selectedMethod,
  };
}

interface OrderSummaryProps {
  locale: string;
  items: CartItem[];
  bundles: Bundle[];
  totals: CheckoutTotals;
  /** "card": sticky desktop column. "collapsible": mobile bar showing the total. */
  variant?: 'card' | 'collapsible';
}

export default function OrderSummary({ locale, items, bundles, totals, variant = 'card' }: OrderSummaryProps) {
  const t = useTranslations('checkout');
  const [open, setOpen] = useState(false);
  const panelId = useId();

  if (variant === 'collapsible') {
    return (
      <div className="rounded-[--radius-lg] bg-white shadow-sm">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
          className="flex min-h-14 w-full items-center justify-between gap-3 px-5 py-3 text-left cursor-pointer"
        >
          <span className="flex items-center gap-2 text-sm font-semibold text-text-dark">
            <svg
              aria-hidden="true"
              className={`h-4 w-4 transition-transform motion-reduce:transition-none ${open ? 'rotate-180' : ''}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {open ? t('summary.hide') : t('summary.show')}
          </span>
          <span className="text-lg font-bold text-text-dark tabular-nums">{formatPrice(totals.total, locale)}</span>
        </button>
        <div id={panelId} hidden={!open} className="border-t border-gray-100 px-5 pb-5 pt-4">
          <SummaryBody locale={locale} items={items} bundles={bundles} totals={totals} />
        </div>
      </div>
    );
  }

  return (
    <section aria-labelledby="checkout-summary-title" className="sticky top-32 rounded-[--radius-lg] bg-white p-6 shadow-sm">
      <h2 id="checkout-summary-title" className="mb-6 font-heading text-xl font-semibold text-text-dark">
        {t('orderSummary')}
      </h2>
      <SummaryBody locale={locale} items={items} bundles={bundles} totals={totals} />
    </section>
  );
}

function SummaryBody({
  locale,
  items,
  bundles,
  totals,
}: {
  locale: string;
  items: CartItem[];
  bundles: Bundle[];
  totals: CheckoutTotals;
}) {
  const t = useTranslations('checkout');
  const tCart = useTranslations('cart');
  const { fullPrice, bundleSavings, promoDiscount, shipping, total, selectedMethod } = totals;

  return (
    <>
      <ul className="mb-6 space-y-3">
        {items.map((item) => {
          const bundle = bundles.find((b) => b.id === item.bundleId);
          if (!bundle) return null;
          return (
            <li key={item.bundleId} className="flex justify-between gap-3 text-sm">
              <span className="text-text-mid">
                {bundle.name} &times; {item.quantity}
              </span>
              <span className="whitespace-nowrap font-medium text-text-dark tabular-nums">
                {formatPrice(bundle.price * item.quantity, locale)}
              </span>
            </li>
          );
        })}
      </ul>

      <dl className="space-y-3 border-t border-gray-100 pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-text-mid">{tCart('subtotal')}</dt>
          <dd className="text-text-dark tabular-nums">{formatPrice(fullPrice, locale)}</dd>
        </div>
        {bundleSavings > 0 && (
          <div className="flex justify-between">
            <dt className="text-text-mid">{tCart('savings')}</dt>
            <dd className="font-medium text-text-dark tabular-nums">-{formatPrice(bundleSavings, locale)}</dd>
          </div>
        )}
        {promoDiscount > 0 && (
          <div className="flex justify-between">
            <dt className="text-text-mid">{tCart('discount')}</dt>
            <dd className="font-medium text-text-dark tabular-nums">-{formatPrice(promoDiscount, locale)}</dd>
          </div>
        )}
        <div className="flex justify-between gap-3">
          <dt className="text-text-mid">
            {tCart('shipping')}
            {selectedMethod && <span className="block text-text-mid">{selectedMethod.name}</span>}
          </dt>
          <dd className="whitespace-nowrap text-text-dark tabular-nums">
            {selectedMethod
              ? shipping === 0
                ? t('shipping.free')
                : formatPrice(shipping, locale)
              : tCart('shippingAtCheckout')}
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex items-baseline justify-between border-t border-gray-200 pt-4">
        <span className="font-heading text-lg font-semibold text-text-dark">{tCart('total')}</span>
        <span className="font-heading text-2xl font-bold text-text-dark tabular-nums" aria-live="polite">
          {formatPrice(total, locale)}
        </span>
      </div>
    </>
  );
}
