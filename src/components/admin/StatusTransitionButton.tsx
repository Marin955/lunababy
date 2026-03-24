'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';

interface StatusTransitionButtonProps {
  currentStatus: string;
  onTransition: (newStatus: string) => Promise<void>;
}

const statusFlow: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: ['refunded'],
  cancelled: [],
  refunded: [],
};

export default function StatusTransitionButton({ currentStatus, onTransition }: StatusTransitionButtonProps) {
  const t = useTranslations('admin.orders');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const nextStatuses = statusFlow[currentStatus] || [];

  if (nextStatuses.length === 0) return null;

  async function handleTransition(status: string) {
    setLoading(true);
    try {
      await onTransition(status);
    } finally {
      setLoading(false);
      setOpen(false);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        disabled={loading}
        className="px-4 py-2 bg-teal-deep text-white text-sm font-semibold rounded-[--radius-sm] hover:bg-teal transition-colors cursor-pointer disabled:opacity-50"
      >
        {t('changeStatus')}
      </button>
      {open && (
        <div className="absolute top-full mt-1 right-0 bg-white border border-gray-200 rounded-[--radius-sm] shadow-lg z-10 min-w-[160px]">
          {nextStatuses.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => handleTransition(status)}
              disabled={loading}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 capitalize cursor-pointer disabled:opacity-50"
            >
              {status}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
