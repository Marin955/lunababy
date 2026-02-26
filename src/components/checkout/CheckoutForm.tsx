'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import Input from '@/components/ui/Input';

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
  onSubmit: (data: CheckoutFormValues) => void;
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

export default function CheckoutForm({ onSubmit }: CheckoutFormProps) {
  const t = useTranslations('checkout');
  const tCommon = useTranslations('common');
  const [values, setValues] = useState<CheckoutFormValues>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutFormValues, string>>>({});

  function handleChange(field: keyof CheckoutFormValues, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
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

    // Email validation
    if (values.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      newErrors.email = t('errors.invalidEmail');
    }

    // Postal code validation (5 digits)
    if (values.postalCode.trim() && !/^\d{5}$/.test(values.postalCode.trim())) {
      newErrors.postalCode = t('errors.invalidPostalCode');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) {
      onSubmit(values);
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

      <button
        type="submit"
        className="mt-6 w-full bg-teal-deep text-white font-semibold py-3 px-6 rounded-[--radius-md] hover:bg-teal shadow-md hover:shadow-hover hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
      >
        {tCommon('buttons.placeOrder')}
      </button>
    </form>
  );
}
