'use client';

import React, { useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useCartStore } from '@/stores/cart-store';

export default function OrderConfirmationPage() {
  const t = useTranslations('confirmation');
  const tCommon = useTranslations('common');
  const clearCart = useCartStore((state) => state.clearCart);

  // Generate a random order number once
  const orderNumber = useMemo(() => {
    const num = Math.floor(10000 + Math.random() * 90000);
    return `LB-${num}`;
  }, []);

  // Clear cart on mount
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="max-w-2xl mx-auto px-6 py-16 text-center">
      {/* Checkmark icon */}
      <div className="mx-auto w-20 h-20 bg-teal-pale rounded-full flex items-center justify-center mb-8">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10 text-teal-deep"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      {/* Title */}
      <h1 className="font-heading text-3xl lg:text-4xl font-semibold text-text-dark mb-4">
        {t('title')}
      </h1>

      {/* Demo message */}
      <p className="text-text-mid mb-8 max-w-lg mx-auto leading-relaxed">
        {t('message')}
      </p>

      {/* Order number */}
      <div className="inline-block bg-gray-50 rounded-[--radius-md] px-6 py-4 mb-8">
        <p className="text-sm text-text-light mb-1">{t('orderNumber')}</p>
        <p className="font-heading text-2xl font-bold text-text-dark">
          {orderNumber}
        </p>
      </div>

      {/* Demo note */}
      <p className="text-sm text-text-light mb-8">
        {t('demoNote')}
      </p>

      {/* Continue shopping button */}
      <Link
        href="/shop"
        className="inline-flex items-center justify-center px-8 py-4 bg-teal-deep text-white font-semibold rounded-[--radius-md] hover:bg-teal shadow-md hover:shadow-hover hover:-translate-y-0.5 transition-all duration-300"
      >
        {t('continueShopping')}
      </Link>
    </div>
  );
}
