'use client';

import React, { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { lookupOrder } from '@/services/api/orders';
import OrderLookupForm from '@/components/orders/OrderLookupForm';
import OrderDetail from '@/components/orders/OrderDetail';
import type { Order } from '@/types';

export default function OrderLookupPage() {
  const t = useTranslations('orderLookup');
  const locale = useLocale();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLookup(orderNumber: string, email: string) {
    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const result = await lookupOrder(orderNumber, email);
      setOrder(result);
    } catch {
      setError(t('notFound'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="text-center mb-8">
        <h1 className="font-heading text-3xl lg:text-4xl font-semibold text-text-dark mb-3">
          {t('title')}
        </h1>
        <p className="text-text-mid">
          {t('description')}
        </p>
      </div>

      <div className="bg-white rounded-[--radius-lg] shadow-sm p-6 mb-8">
        <OrderLookupForm
          onLookup={handleLookup}
          loading={loading}
          error={error}
        />
      </div>

      {order && (
        <div className="bg-white rounded-[--radius-lg] shadow-sm p-6">
          <OrderDetail order={order} locale={locale} />
        </div>
      )}
    </div>
  );
}
