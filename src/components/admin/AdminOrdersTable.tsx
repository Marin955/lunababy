'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { formatPrice } from '@/lib/utils';
import type { Order } from '@/types';

interface AdminOrdersTableProps {
  orders: Order[];
}

export default function AdminOrdersTable({ orders }: AdminOrdersTableProps) {
  const t = useTranslations('admin.orders');

  if (orders.length === 0) {
    return <p className="text-text-mid text-sm py-4">{t('noOrders')}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left px-4 py-3 text-text-mid font-medium">{t('orderNumber')}</th>
            <th className="text-left px-4 py-3 text-text-mid font-medium">{t('customer')}</th>
            <th className="text-left px-4 py-3 text-text-mid font-medium">{t('status')}</th>
            <th className="text-left px-4 py-3 text-text-mid font-medium">{t('date')}</th>
            <th className="text-right px-4 py-3 text-text-mid font-medium">{t('total')}</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50">
              <td className="px-4 py-3">
                <Link href={`/admin/orders/${order.order_number}`} className="text-teal-deep hover:text-teal font-medium">
                  {order.order_number}
                </Link>
              </td>
              <td className="px-4 py-3 text-text-mid">
                <div>{order.customer_name}</div>
                <div className="text-xs text-text-light">{order.customer_email}</div>
              </td>
              <td className="px-4 py-3">
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 capitalize">{order.status}</span>
              </td>
              <td className="px-4 py-3 text-text-mid">
                {new Date(order.created_at).toLocaleDateString('hr-HR')}
              </td>
              <td className="px-4 py-3 text-right font-medium">{formatPrice(order.total, 'hr')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
