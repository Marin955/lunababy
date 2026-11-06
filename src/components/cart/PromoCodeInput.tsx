'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useCartStore } from '@/stores/cart-store';
import { validatePromoCode } from '@/services/api/promo-codes';
import type { PromoValidation } from '@/types';

interface PromoCodeInputProps {
  locale: string;
  cartTotal: number;
  onValidated: (result: PromoValidation | null) => void;
}

export default function PromoCodeInput({ locale, cartTotal, onValidated }: PromoCodeInputProps) {
  const t = useTranslations('cart');
  const promoCode = useCartStore((state) => state.promoCode);
  const applyPromo = useCartStore((state) => state.applyPromo);
  const removePromo = useCartStore((state) => state.removePromo);

  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activePromo, setActivePromo] = useState<PromoValidation | null>(null);

  const handleApply = async () => {
    setError(null);
    setSuccess(null);

    if (!inputValue.trim()) return;

    setLoading(true);
    try {
      const result = await validatePromoCode(inputValue, cartTotal, locale);
      if (result.valid) {
        applyPromo(result.code);
        setActivePromo(result);
        onValidated(result);
        setSuccess(t('promoSuccess'));
        setInputValue('');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.reason || t('promoInvalid'));
        onValidated(null);
      }
    } catch {
      setError(t('promoInvalid'));
      onValidated(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleApply();
    }
  };

  const handleRemove = () => {
    removePromo();
    setActivePromo(null);
    onValidated(null);
    setError(null);
    setSuccess(null);
    setInputValue('');
  };

  return (
    <div className="space-y-3">
      <label htmlFor="promo-code" className="block text-sm font-medium text-text-dark">
        {t('promoCode')}
      </label>

      {activePromo || promoCode ? (
        <div className="flex items-center justify-between bg-teal-pale/50 border border-teal/20 rounded-[--radius-sm] px-4 py-3">
          <div>
            <span className="font-semibold text-[var(--color-teal-ink,#3F7C87)] text-sm">
              {activePromo?.code || promoCode}
            </span>
            {activePromo?.label && (
              <p className="text-xs text-text-mid mt-0.5">
                {activePromo.label}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="min-h-[44px] px-2 text-sm text-text-mid hover:text-red-600 transition-colors font-medium cursor-pointer"
          >
            {t('promoRemove')}
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            id="promo-code"
            type="text"
            autoComplete="off"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setError(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder={t('promoPlaceholder')}
            disabled={loading}
            className={`
              flex-1 min-w-0 px-4 min-h-[44px]
              rounded-[--radius-sm]
              border bg-white
              focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal
              transition-all
              font-body text-text-dark text-sm
              placeholder:text-text-mid
              ${error ? 'border-red-400' : 'border-gray-200'}
              ${loading ? 'opacity-50' : ''}
            `}
          />
          <button
            type="button"
            onClick={handleApply}
            disabled={loading}
            className="px-5 min-h-[44px] bg-[var(--color-teal-ink,#3F7C87)] text-white text-sm font-semibold rounded-[--radius-sm] hover:opacity-90 transition-opacity cursor-pointer shrink-0 disabled:opacity-50"
          >
            {loading ? '...' : t('promoApply')}
          </button>
        </div>
      )}

      {error && <p className="text-red-600 text-sm" role="alert">{error}</p>}
      {success && <p className="text-[var(--color-teal-ink,#3F7C87)] text-sm font-medium" role="status">{success}</p>}
    </div>
  );
}
