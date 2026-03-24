'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import type { Address } from '@/types';

interface SavedAddressSelectorProps {
  addresses: Address[];
  onSelect: (address: Address) => void;
}

export default function SavedAddressSelector({ addresses, onSelect }: SavedAddressSelectorProps) {
  const t = useTranslations('checkout');

  if (addresses.length === 0) return null;

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-text-dark mb-2">
        {t('savedAddresses')}
      </label>
      <div className="space-y-2">
        {addresses.map((address) => (
          <button
            key={address.id}
            type="button"
            onClick={() => onSelect(address)}
            className="w-full text-left p-3 rounded-[--radius-sm] border border-gray-200 hover:border-teal/30 hover:bg-teal-pale/10 transition-all cursor-pointer text-sm"
          >
            <span className="font-medium text-text-dark">
              {address.first_name} {address.last_name}
            </span>
            <span className="text-text-mid"> — {address.street}, {address.postal_code} {address.city}</span>
            {address.is_default && (
              <span className="ml-2 text-xs bg-teal-light text-teal-deep px-2 py-0.5 rounded-full">
                {t('defaultAddress')}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
