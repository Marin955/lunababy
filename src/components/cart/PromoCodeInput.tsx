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
      <label className="block text-sm font-medium text-text-dark">
        {t('promoCode')}
      </label>

      {activePromo || promoCode ? (
        <div className="flex items-center justify-between bg-teal-pale/50 border border-teal/20 rounded-[--radius-sm] px-4 py-3">
          <div>
            <span className="font-semibold text-teal-deep text-sm">
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
            className="text-sm text-text-mid hover:text-red-500 transition-colors font-medium cursor-pointer"
          >
            {t('promoRemove')}
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setError(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder={t('promoPlaceholder')}
            disabled={loading}
            className={`
              flex-1 px-4 py-2.5
              rounded-[--radius-sm]
              border bg-white
              focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal
              transition-all
              font-body text-text-dark text-sm
              placeholder:text-text-light
              ${error ? 'border-red-400' : 'border-gray-200'}
              ${loading ? 'opacity-50' : ''}
            `}
          />
          <button
            type="button"
            onClick={handleApply}
            disabled={loading}
            className="px-5 py-2.5 bg-teal-deep text-white text-sm font-semibold rounded-[--radius-sm] hover:bg-teal transition-colors cursor-pointer shrink-0 disabled:opacity-50"
          >
            {loading ? '...' : t('promoApply')}
          </button>
        </div>
      )}

      {error && <p className="text-red-500 text-xs">{error}</p>}
      {success && <p className="text-teal-deep text-xs font-medium">{success}</p>}
    </div>
  );
}
