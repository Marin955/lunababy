'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useCartStore } from '@/stores/cart-store';
import { getBundles } from '@/services/bundle-service';
import { formatPrice } from '@/lib/utils';
import type { Locale } from '@/i18n/routing';

interface CartItemProps {
  bundleId: string;
  quantity: number;
  locale: string;
}

export default function CartItem({ bundleId, quantity, locale }: CartItemProps) {
  const t = useTranslations('cart');
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const bundles = getBundles();
  const bundle = bundles.find((b) => b.id === bundleId);

  if (!bundle) return null;

  const lang = locale as Locale;
  const lineTotal = bundle.price * quantity;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-6 border-b border-gray-100 last:border-b-0">
      {/* Emoji icon with gradient background */}
      <div
        className={`
          w-16 h-16 rounded-[--radius-md] flex items-center justify-center text-2xl shrink-0
          bg-gradient-to-br from-${bundle.colorFrom} to-${bundle.colorTo}
        `}
      >
        {bundle.emoji}
      </div>

      {/* Bundle info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-heading font-semibold text-text-dark text-base truncate">
          {bundle.name[lang]}
        </h3>
        <p className="text-sm text-text-mid mt-0.5">
          {formatPrice(bundle.price)}
        </p>
      </div>

      {/* Mobile: quantity + total + remove in a row */}
      <div className="flex items-center gap-3 w-full sm:w-auto sm:contents">
        {/* Quantity controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => updateQuantity(bundleId, quantity - 1)}
            disabled={quantity <= 1}
            className="w-11 h-11 rounded-full border border-gray-200 flex items-center justify-center text-text-mid hover:border-teal hover:text-teal-deep transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            aria-label={`Decrease quantity`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
            </svg>
          </button>

          <span className="w-8 text-center font-medium text-text-dark text-sm">
            {quantity}
          </span>

          <button
            type="button"
            onClick={() => updateQuantity(bundleId, quantity + 1)}
            disabled={quantity >= 10}
            className="w-11 h-11 rounded-full border border-gray-200 flex items-center justify-center text-text-mid hover:border-teal hover:text-teal-deep transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            aria-label={`Increase quantity`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Line total */}
        <div className="flex-1 sm:flex-none sm:w-24 text-right">
          <span className="font-semibold text-text-dark">
            {formatPrice(lineTotal)}
          </span>
        </div>

        {/* Remove button */}
        <button
          type="button"
          onClick={() => removeItem(bundleId)}
          className="text-text-light hover:text-red-500 transition-colors p-2 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label={t('remove')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}
