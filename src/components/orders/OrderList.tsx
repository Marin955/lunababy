'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { formatPrice } from '@/lib/utils';
import type { Order } from '@/types';

interface OrderListProps {
  orders: Order[];
  locale: string;
  onSelect: (order: Order) => void;
}

export default function OrderList({ orders, locale, onSelect }: OrderListProps) {
  const t = useTranslations('orders');

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-indigo-100 text-indigo-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800',
  };

  if (orders.length === 0) {
    return <p className="text-text-mid text-sm py-4">{t('noOrders')}</p>;
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <button
          key={order.id}
          type="button"
          onClick={() => onSelect(order)}
          className="w-full text-left p-4 rounded-[--radius-md] border border-gray-200 hover:border-teal/30 hover:bg-teal-pale/10 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-text-dark text-sm">
              {order.order_number}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
              {t(`status${order.status.charAt(0).toUpperCase() + order.status.slice(1)}`)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-mid">
              {new Date(order.created_at).toLocaleDateString(locale === 'hr' ? 'hr-HR' : 'en-US')}
            </span>
            <span className="font-medium text-text-dark">
              {formatPrice(order.total, locale)}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
