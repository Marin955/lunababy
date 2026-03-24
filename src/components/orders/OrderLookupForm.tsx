'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import Input from '@/components/ui/Input';

interface OrderLookupFormProps {
  onLookup: (orderNumber: string, email: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export default function OrderLookupForm({ onLookup, loading, error }: OrderLookupFormProps) {
  const t = useTranslations('orderLookup');
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ orderNumber?: string; email?: string }>({});

  function validate(): boolean {
    const errors: { orderNumber?: string; email?: string } = {};
    if (!orderNumber.trim()) {
      errors.orderNumber = t('errors.required');
    }
    if (!email.trim()) {
      errors.email = t('errors.required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = t('errors.invalidEmail');
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    await onLookup(orderNumber.trim(), email.trim());
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <Input
        label={t('orderNumber')}
        value={orderNumber}
        onChange={(e) => {
          setOrderNumber(e.target.value);
          setFieldErrors((prev) => ({ ...prev, orderNumber: undefined }));
        }}
        placeholder="LB-XXXXXXXX"
        error={fieldErrors.orderNumber}
        required
      />
      <Input
        label={t('email')}
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setFieldErrors((prev) => ({ ...prev, email: undefined }));
        }}
        placeholder={t('emailPlaceholder')}
        error={fieldErrors.email}
        required
      />

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-[--radius-sm] text-sm text-red-600">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-teal-deep text-white font-semibold py-3 px-6 rounded-[--radius-md] hover:bg-teal shadow-md hover:shadow-hover hover:-translate-y-0.5 transition-all duration-300 cursor-pointer disabled:opacity-50"
      >
        {loading ? '...' : t('search')}
      </button>
    </form>
  );
}
