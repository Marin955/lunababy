'use client';

import React, { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/auth-store';
import { fetchOrders } from '@/services/api/orders';
import AuthGuard from '@/components/auth/AuthGuard';
import OrderList from '@/components/orders/OrderList';
import OrderDetail from '@/components/orders/OrderDetail';
import type { Order, PaginationMeta } from '@/types';

function OrdersContent() {
  const t = useTranslations('orders');
  const locale = useLocale();
  const token = useAuthStore((state) => state.token);

  const [orders, setOrders] = useState<Order[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetchOrders(page, token, locale)
      .then((res) => {
        setOrders(res.data);
        setMeta(res.meta);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token, page, locale]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-100 rounded w-48" />
        <div className="h-32 bg-gray-100 rounded-[--radius-md]" />
      </div>
    );
  }

  if (selectedOrder) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setSelectedOrder(null)}
          className="text-sm text-teal-deep hover:text-teal font-medium cursor-pointer"
        >
          &larr; {t('backToOrders')}
        </button>
        <div className="bg-white rounded-[--radius-lg] shadow-sm p-6">
          <OrderDetail order={selectedOrder} locale={locale} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl font-semibold text-text-dark">
        {t('title')}
      </h1>

      <div className="bg-white rounded-[--radius-lg] shadow-sm p-6">
        <OrderList orders={orders} locale={locale} onSelect={setSelectedOrder} />
      </div>

      {/* Pagination */}
      {meta && meta.total_pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: meta.total_pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPage(p)}
              className={`w-10 h-10 rounded-full text-sm font-medium cursor-pointer transition-colors ${
                p === page
                  ? 'bg-teal-deep text-white'
                  : 'bg-gray-100 text-text-mid hover:bg-gray-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <AuthGuard>
        <OrdersContent />
      </AuthGuard>
    </div>
  );
}
