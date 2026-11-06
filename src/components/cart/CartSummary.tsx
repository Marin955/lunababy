'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useCartStore } from '@/stores/cart-store';
import { calculateBundleSavings, calculateSubtotal } from '@/services/cart-service';
import { formatPrice } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { Link } from '@/i18n/navigation';
import type { Bundle, PromoValidation } from '@/types';
import { COLLECTION_HREF } from '@/lib/constants';

interface CartSummaryProps {
  locale: string;
  bundles: Bundle[];
  promoValidation: PromoValidation | null;
}

export default function CartSummary({ locale, bundles, promoValidation }: CartSummaryProps) {
  const t = useTranslations('cart');
  const tCommon = useTranslations('common');
  const items = useCartStore((state) => state.items);

  // Subtotal using sale prices (what the customer actually pays for items)
  const subtotal = calculateSubtotal(items, bundles);
  const promoDiscount = promoValidation?.valid ? (promoValidation.discount_amount ?? 0) : 0;

  // Calculate savings from bundle discounts (original_price vs price)
  const bundleSavings = calculateBundleSavings(items, bundles);

  // Full price before any discounts
  const fullPrice = subtotal + bundleSavings;
  const total = subtotal - promoDiscount;

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-50 rounded-[--radius-lg] p-6 space-y-4 sticky top-32">
      {/* Full price (before discounts) */}
      <div className="flex justify-between text-sm">
        <span className="text-text-mid">{t('subtotal')}</span>
        <span className="font-medium text-text-dark">{formatPrice(fullPrice, locale)}</span>
      </div>

      {/* Bundle discount savings */}
      {bundleSavings > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-text-mid">{t('savings')}</span>
          <span className="font-medium text-text-dark">-{formatPrice(bundleSavings, locale)}</span>
        </div>
      )}

      {/* Promo code discount */}
      {promoDiscount > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-[var(--color-teal-ink,#3F7C87)]">{t('discount')}</span>
          <span className="font-medium tabular-nums text-[var(--color-teal-ink,#3F7C87)]">-{formatPrice(promoDiscount, locale)}</span>
        </div>
      )}

      {/* Shipping */}
      <div className="flex justify-between text-sm">
        <span className="text-text-mid">{t('shipping')}</span>
        <span className="text-text-mid text-[13px]">{t('shippingAtCheckout')}</span>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex justify-between">
          <span className="font-heading font-semibold text-text-dark">{t('total')}</span>
          <span className="font-heading font-semibold text-text-dark text-lg">
            {formatPrice(total, locale)}
          </span>
        </div>
      </div>

      {/* Checkout button */}
      <Button href="/checkout" variant="primary" size="lg" className="w-full">
        {tCommon('buttons.proceedToCheckout')}
      </Button>

      {/* Continue shopping */}
      <div className="text-center">
        <Link
          href={COLLECTION_HREF}
          className="inline-flex min-h-[44px] items-center text-sm font-semibold text-[var(--color-teal-ink,#3F7C87)] hover:underline underline-offset-2"
        >
          {tCommon('buttons.continueShopping')}
        </Link>
      </div>
    </div>
  );
}
