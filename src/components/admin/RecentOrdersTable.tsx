'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { formatPrice } from '@/lib/utils';
import type { AdminRecentOrder } from '@/types';

interface RecentOrdersTableProps {
  orders: AdminRecentOrder[];
}

export default function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  const t = useTranslations('admin.dashboard');

  return (
    <div className="bg-white rounded-[--radius-md] shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="font-semibold text-text-dark">{t('recentOrders')}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-4 py-2 text-text-mid font-medium">Order</th>
              <th className="text-left px-4 py-2 text-text-mid font-medium">Customer</th>
              <th className="text-left px-4 py-2 text-text-mid font-medium">Status</th>
              <th className="text-right px-4 py-2 text-text-mid font-medium">Total</th>
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
                <td className="px-4 py-3 text-text-mid">{order.customer_name}</td>
                <td className="px-4 py-3">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-text-mid capitalize">
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-medium">{formatPrice(order.total, 'hr')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
