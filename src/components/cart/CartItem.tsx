'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useCartStore } from '@/stores/cart-store';
import { formatPrice } from '@/lib/utils';
import { Link } from '@/i18n/navigation';
import { bundlePath } from '@/lib/shop-paths';
import type { Bundle } from '@/types';
import BundleThumb from '@/components/cart/BundleThumb';

interface CartItemProps {
  bundleId: string;
  quantity: number;
  locale: string;
  /** undefined while the bundle list is loading: renders a placeholder line. */
  bundle: Bundle | undefined;
}

/** Line placeholder shown only while bundle data is missing (cold cache). */
export function CartItemSkeleton({ quantity }: { quantity: number }) {
  return (
    <div className="flex items-center gap-4 py-6 border-b border-gray-100 last:border-b-0" aria-hidden="true">
      <div className="w-[72px] h-[72px] rounded-[--radius-md] bg-gray-100 animate-pulse shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-1/2 rounded bg-gray-100 animate-pulse" />
        <div className="h-3 w-1/4 rounded bg-gray-100 animate-pulse" />
      </div>
      <span className="w-8 text-center font-medium text-text-dark text-sm">{quantity}</span>
      <div className="hidden sm:block h-4 w-20 rounded bg-gray-100 animate-pulse" />
    </div>
  );
}

export default function CartItem({ bundleId, quantity, locale, bundle }: CartItemProps) {
  const t = useTranslations('cart');
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  if (!bundle) return null;

  const lineTotal = bundle.price * quantity;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 py-6 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Bundle photo (gradient + emoji only when no image exists) */}
        <Link href={bundlePath(locale, bundle.slug)} tabIndex={-1} aria-hidden="true" className="shrink-0">
          <BundleThumb bundle={bundle} size={72} />
        </Link>

        {/* Bundle info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-heading font-semibold text-text-dark text-base truncate">
            <Link href={bundlePath(locale, bundle.slug)} className="hover:underline underline-offset-2">
              {bundle.name}
            </Link>
          </h3>
          <div className="flex flex-wrap items-center gap-x-2 mt-0.5">
            {bundle.original_price && (
              <span className="text-sm text-text-mid line-through">{formatPrice(bundle.original_price, locale)}</span>
            )}
            <span className="text-sm text-text-mid tabular-nums">{formatPrice(bundle.price, locale)}</span>
            {bundle.discount_percent > 0 && (
              <span className="text-sm text-red-700 font-semibold">-{bundle.discount_percent}%</span>
            )}
          </div>
        </div>
      </div>

      {/* Quantity + total + remove */}
      <div className="flex items-center gap-3 w-full sm:w-auto sm:contents">
        {/* Quantity controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => updateQuantity(bundleId, quantity - 1)}
            disabled={quantity <= 1}
            className="w-11 h-11 rounded-full border border-gray-200 flex items-center justify-center text-text-mid hover:border-teal hover:text-text-dark transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            aria-label={t('decrease', { name: bundle.name })}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
            </svg>
          </button>

          <span className="w-8 text-center font-medium text-text-dark text-sm tabular-nums">{quantity}</span>

          <button
            type="button"
            onClick={() => updateQuantity(bundleId, quantity + 1)}
            disabled={quantity >= 10}
            className="w-11 h-11 rounded-full border border-gray-200 flex items-center justify-center text-text-mid hover:border-teal hover:text-text-dark transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            aria-label={t('increase', { name: bundle.name })}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Line total */}
        <div className="flex-1 sm:flex-none sm:w-24 text-right">
          <span className="font-semibold text-text-dark tabular-nums whitespace-nowrap">
            {formatPrice(lineTotal, locale)}
          </span>
        </div>

        {/* Remove button */}
        <button
          type="button"
          onClick={() => removeItem(bundleId)}
          className="text-text-mid hover:text-red-600 transition-colors p-2 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label={t('removeItem', { name: bundle.name })}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
