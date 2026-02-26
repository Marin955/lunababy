'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useCartStore } from '@/stores/cart-store';
import { getBundles } from '@/services/bundle-service';
import {
  calculateSubtotal,
  validatePromoCode,
  calculateDiscount,
} from '@/services/cart-service';
import { formatPrice } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { Link } from '@/i18n/navigation';

interface CartSummaryProps {
  locale: string;
}

export default function CartSummary({ locale }: CartSummaryProps) {
  const t = useTranslations('cart');
  const tCommon = useTranslations('common');
  const items = useCartStore((state) => state.items);
  const promoCode = useCartStore((state) => state.promoCode);

  const bundles = getBundles();
  const subtotal = calculateSubtotal(items, bundles);
  const validatedPromo = promoCode ? validatePromoCode(promoCode) : null;
  const discount = calculateDiscount(subtotal, validatedPromo);
  const total = subtotal - discount;

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-50 rounded-[--radius-lg] p-6 space-y-4 sticky top-24">
      {/* Subtotal */}
      <div className="flex justify-between text-sm">
        <span className="text-text-mid">{t('subtotal')}</span>
        <span className="font-medium text-text-dark">{formatPrice(subtotal)}</span>
      </div>

      {/* Discount line */}
      {discount > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-teal-deep">{t('discount')}</span>
          <span className="font-medium text-teal-deep">-{formatPrice(discount)}</span>
        </div>
      )}

      {/* Shipping */}
      <div className="flex justify-between text-sm">
        <span className="text-text-mid">{t('shipping')}</span>
        <span className="text-text-light text-xs">{t('shippingAtCheckout')}</span>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex justify-between">
          <span className="font-heading font-semibold text-text-dark">{t('total')}</span>
          <span className="font-heading font-semibold text-text-dark text-lg">
            {formatPrice(total)}
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
          href="/shop"
          className="text-sm text-teal-deep hover:text-teal transition-colors font-medium"
        >
          {tCommon('buttons.continueShopping')}
        </Link>
      </div>
    </div>
  );
}
