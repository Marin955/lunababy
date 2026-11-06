'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { formatPrice } from '@/lib/utils';

interface FreeShippingProgressProps {
  /** Cart subtotal in cents: after bundle discounts, before promo codes (same as checkout's shipping rule). */
  subtotal: number;
  /** Lowest free-shipping threshold in cents; renders nothing when null. */
  threshold: number | null;
  locale: string;
  className?: string;
}

export default function FreeShippingProgress({
  subtotal,
  threshold,
  locale,
  className = '',
}: FreeShippingProgressProps) {
  const t = useTranslations('cart.freeShipping');

  if (threshold === null || threshold <= 0) return null;

  const reached = subtotal >= threshold;
  const remaining = Math.max(0, threshold - subtotal);
  const percent = Math.min(100, Math.round((subtotal / threshold) * 100));
  const label = reached
    ? t('reached')
    : t('remaining', { amount: formatPrice(remaining, locale) });

  return (
    <div
      className={`rounded-[--radius-md] border border-teal/20 bg-teal-pale/50 px-4 py-3 ${className}`}
    >
      <p className="flex items-center gap-2 text-sm font-semibold text-[var(--color-teal-ink,#3F7C87)]">
        {reached && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.25}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
        <span>{label}</span>
      </p>
      <div
        className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white"
        role="progressbar"
        aria-label={t('label')}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-valuetext={label}
      >
        <div
          className="h-full rounded-full bg-[var(--color-teal-ink,#3F7C87)] motion-safe:transition-[width] motion-safe:duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
      {!reached && (
        <p className="mt-1.5 text-[13px] text-text-mid">
          {t('threshold', { amount: formatPrice(threshold, locale) })}
        </p>
      )}
    </div>
  );
}
