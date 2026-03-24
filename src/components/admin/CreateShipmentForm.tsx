'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import Input from '@/components/ui/Input';

interface CreateShipmentFormProps {
  onSubmit: (carrier: string, trackingNumber: string) => Promise<void>;
}

const carriers = ['GLS', 'DPD', 'HP Pošta', 'Overseas'];

export default function CreateShipmentForm({ onSubmit }: CreateShipmentFormProps) {
  const t = useTranslations('admin.orders');
  const [carrier, setCarrier] = useState(carriers[0]);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!trackingNumber.trim()) return;
    setLoading(true);
    try {
      await onSubmit(carrier, trackingNumber.trim());
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h4 className="font-semibold text-text-dark text-sm">{t('createShipment')}</h4>
      <div>
        <label className="block text-sm font-medium text-text-dark mb-1.5">{t('carrier')}</label>
        <select
          value={carrier}
          onChange={(e) => setCarrier(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-[--radius-sm] bg-white text-text-dark text-sm"
        >
          {carriers.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <Input
        label={t('trackingNumber')}
        value={trackingNumber}
        onChange={(e) => setTrackingNumber(e.target.value)}
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-teal-deep text-white font-semibold py-2 px-4 rounded-[--radius-sm] text-sm hover:bg-teal transition-colors cursor-pointer disabled:opacity-50"
      >
        {loading ? '...' : t('ship')}
      </button>
    </form>
  );
}
