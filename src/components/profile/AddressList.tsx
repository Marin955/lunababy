'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import type { Address } from '@/types';

interface AddressListProps {
  addresses: Address[];
  onEdit: (address: Address) => void;
  onDelete: (id: string) => void;
}

export default function AddressList({ addresses, onEdit, onDelete }: AddressListProps) {
  const t = useTranslations('addresses');

  if (addresses.length === 0) {
    return (
      <p className="text-text-mid text-sm py-4">{t('noAddresses')}</p>
    );
  }

  return (
    <div className="space-y-3">
      {addresses.map((address) => (
        <div
          key={address.id}
          className={`p-4 rounded-[--radius-md] border ${
            address.is_default ? 'border-teal bg-teal-pale/20' : 'border-gray-200'
          }`}
        >
          <div className="flex justify-between items-start">
            <div className="text-sm space-y-1">
              <p className="font-semibold text-text-dark">
                {address.first_name} {address.last_name}
                {address.is_default && (
                  <span className="ml-2 text-xs bg-teal-light text-teal-deep px-2 py-0.5 rounded-full">
                    {t('default')}
                  </span>
                )}
              </p>
              <p className="text-text-mid">{address.street}</p>
              <p className="text-text-mid">{address.postal_code} {address.city}</p>
              <p className="text-text-mid">{address.phone}</p>
              {address.company && <p className="text-text-light">{address.company}</p>}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onEdit(address)}
                className="text-xs text-teal-deep hover:text-teal font-medium cursor-pointer"
              >
                {t('edit')}
              </button>
              <button
                type="button"
                onClick={() => onDelete(address.id)}
                className="text-xs text-text-light hover:text-red-500 font-medium cursor-pointer"
              >
                {t('delete')}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
