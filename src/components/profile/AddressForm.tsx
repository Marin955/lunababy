'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import Input from '@/components/ui/Input';
import type { Address } from '@/types';

interface AddressFormProps {
  address?: Address;
  onSave: (data: Omit<Address, 'id'>) => Promise<void>;
  onCancel: () => void;
}

export default function AddressForm({ address, onSave, onCancel }: AddressFormProps) {
  const t = useTranslations('addresses');

  const [firstName, setFirstName] = useState(address?.first_name || '');
  const [lastName, setLastName] = useState(address?.last_name || '');
  const [street, setStreet] = useState(address?.street || '');
  const [city, setCity] = useState(address?.city || '');
  const [postalCode, setPostalCode] = useState(address?.postal_code || '');
  const [phone, setPhone] = useState(address?.phone || '');
  const [company, setCompany] = useState(address?.company || '');
  const [isDefault, setIsDefault] = useState(address?.is_default || false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        street: street.trim(),
        city: city.trim(),
        postal_code: postalCode.trim(),
        phone: phone.trim(),
        company: company.trim() || null,
        is_default: isDefault,
      });
    } catch {
      setError(t('saveError'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label={t('firstName')}
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <Input
          label={t('lastName')}
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
      </div>
      <Input
        label={t('street')}
        value={street}
        onChange={(e) => setStreet(e.target.value)}
        required
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label={t('postalCode')}
          value={postalCode}
          onChange={(e) => setPostalCode(e.target.value)}
          required
        />
        <Input
          label={t('city')}
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
        />
      </div>
      <Input
        label={t('phone')}
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        required
      />
      <Input
        label={t('company')}
        value={company}
        onChange={(e) => setCompany(e.target.value)}
      />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={isDefault}
          onChange={(e) => setIsDefault(e.target.checked)}
          className="accent-teal-deep"
        />
        <span className="text-text-mid">{t('setAsDefault')}</span>
      </label>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 bg-teal-deep text-white font-semibold py-3 px-6 rounded-[--radius-md] hover:bg-teal transition-colors cursor-pointer disabled:opacity-50"
        >
          {saving ? '...' : t('save')}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-gray-200 rounded-[--radius-md] text-text-mid hover:text-text-dark transition-colors cursor-pointer"
        >
          {t('cancel')}
        </button>
      </div>
    </form>
  );
}
