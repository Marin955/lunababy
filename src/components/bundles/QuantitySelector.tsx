'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { MAX_QUANTITY_PER_LINE } from '@/components/bundles/product-page';

interface QuantitySelectorProps {
  value: number;
  max: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  id?: string;
}

export default function QuantitySelector({ value, max, onChange, disabled = false, id = 'quantity' }: QuantitySelectorProps) {
  const t = useTranslations('bundle.quantity');
  const upper = Math.max(1, Math.min(MAX_QUANTITY_PER_LINE, max));

  const set = (next: number) => onChange(Math.max(1, Math.min(upper, next)));

  const buttonClasses =
    'w-11 h-11 flex items-center justify-center text-xl text-text-dark rounded-full ' +
    'hover:bg-teal-pale disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors ' +
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-deep';

  return (
    <div className="flex items-center gap-4">
      <label htmlFor={id} className="text-sm font-semibold text-text-dark">
        {t('label')}
      </label>
      <div className="inline-flex items-center rounded-full border border-gray-300 bg-white">
        <button
          type="button"
          className={buttonClasses}
          onClick={() => set(value - 1)}
          disabled={disabled || value <= 1}
          aria-label={t('decrease')}
          aria-controls={id}
        >
          <span aria-hidden="true">−</span>
        </button>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={1}
          max={upper}
          value={value}
          disabled={disabled}
          onChange={(e) => {
            const parsed = Number.parseInt(e.target.value, 10);
            if (!Number.isNaN(parsed)) set(parsed);
          }}
          className="w-10 h-11 text-center text-base font-semibold text-text-dark bg-transparent tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none focus:outline-none"
        />
        <button
          type="button"
          className={buttonClasses}
          onClick={() => set(value + 1)}
          disabled={disabled || value >= upper}
          aria-label={t('increase')}
          aria-controls={id}
        >
          <span aria-hidden="true">+</span>
        </button>
      </div>
    </div>
  );
}
