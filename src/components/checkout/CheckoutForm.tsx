'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useCartStore } from '@/stores/cart-store';
import { useAuthStore } from '@/stores/auth-store';
import { createOrder } from '@/services/api/orders';
import type { CreateOrderParams } from '@/services/api/orders';
import Input from '@/components/ui/Input';
import type { Bundle, CartItem } from '@/types';

export interface CheckoutFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  postalCode: string;
  city: string;
  company: string;
  note: string;
}

interface CheckoutFormProps {
  locale: string;
  items: CartItem[];
  bundles: Bundle[];
  shippingMethodId: string | null;
  promoCode: string | null;
  onOrderPlaced?: () => void;
}

const initialValues: CheckoutFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  street: '',
  postalCode: '',
  city: '',
  company: '',
  note: '',
};

export default function CheckoutForm({
  locale,
  items,
  bundles,
  shippingMethodId,
  promoCode,
  onOrderPlaced,
}: CheckoutFormProps) {
  const t = useTranslations('checkout');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const clearCart = useCartStore((state) => state.clearCart);
  const token = useAuthStore((state) => state.token);

  const [values, setValues] = useState<CheckoutFormValues>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutFormValues, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function handleChange(field: keyof CheckoutFormValues, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  function validate(): boolean {
    const newErrors: Partial<Record<keyof CheckoutFormValues, string>> = {};

    const requiredFields: (keyof CheckoutFormValues)[] = [
      'firstName',
      'lastName',
      'email',
      'phone',
      'street',
      'postalCode',
      'city',
    ];

    for (const field of requiredFields) {
      if (!values[field].trim()) {
        newErrors[field] = t('errors.required');
      }
    }

    if (values.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      newErrors.email = t('errors.invalidEmail');
    }

    if (values.postalCode.trim() && !/^\d{5}$/.test(values.postalCode.trim())) {
      newErrors.postalCode = t('errors.invalidPostalCode');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate() || !shippingMethodId) return;

    setSubmitting(true);
    setSubmitError(null);

    const orderParams: CreateOrderParams = {
      customer_email: values.email.trim(),
      customer_name: `${values.firstName.trim()} ${values.lastName.trim()}`,
      shipping_method_id: shippingMethodId,
      language: locale,
      note: values.note.trim() || undefined,
      promo_code: promoCode || undefined,
      shipping_address: {
        first_name: values.firstName.trim(),
        last_name: values.lastName.trim(),
        street: values.street.trim(),
        city: values.city.trim(),
        postal_code: values.postalCode.trim(),
        phone: values.phone.trim(),
        company: values.company.trim() || undefined,
      },
      items: items.map((item) => ({
        bundle_id: item.bundleId,
        quantity: item.quantity,
      })),
    };

    try {
      const order = await createOrder(orderParams, token);
      onOrderPlaced?.();
      clearCart();
      router.push(`/order-confirmation?order=${order.order_number}&email=${encodeURIComponent(values.email.trim())}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('errors.orderFailed');
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label={t('form.firstName')}
          value={values.firstName}
          onChange={(e) => handleChange('firstName', e.target.value)}
          error={errors.firstName}
          required
        />
        <Input
          label={t('form.lastName')}
          value={values.lastName}
          onChange={(e) => handleChange('lastName', e.target.value)}
          error={errors.lastName}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <Input
          label={t('form.email')}
          type="email"
          value={values.email}
          onChange={(e) => handleChange('email', e.target.value)}
          error={errors.email}
          required
        />
        <Input
          label={t('form.phone')}
          value={values.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          placeholder={t('form.phonePlaceholder')}
          error={errors.phone}
          required
        />
      </div>

      <div className="mt-4">
        <Input
          label={t('form.street')}
          value={values.street}
          onChange={(e) => handleChange('street', e.target.value)}
          placeholder={t('form.streetPlaceholder')}
          error={errors.street}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <Input
          label={t('form.postalCode')}
          value={values.postalCode}
          onChange={(e) => handleChange('postalCode', e.target.value)}
          placeholder={t('form.postalCodePlaceholder')}
          error={errors.postalCode}
          required
        />
        <Input
          label={t('form.city')}
          value={values.city}
          onChange={(e) => handleChange('city', e.target.value)}
          error={errors.city}
          required
        />
      </div>

      <div className="mt-4">
        <Input
          label={t('form.company')}
          value={values.company}
          onChange={(e) => handleChange('company', e.target.value)}
        />
      </div>

      <div className="mt-4">
        <Input
          label={t('form.note')}
          type="textarea"
          value={values.note}
          onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => handleChange('note', e.target.value)}
          placeholder={t('form.notePlaceholder')}
        />
      </div>

      {submitError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-[--radius-sm] text-sm text-red-600">
          {submitError}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-6 w-full bg-teal-deep text-white font-semibold py-3 px-6 rounded-[--radius-md] hover:bg-teal shadow-md hover:shadow-hover hover:-translate-y-0.5 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? '...' : tCommon('buttons.placeOrder')}
      </button>
    </form>
  );
}
