'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { formatPrice } from '@/lib/utils';
import type { AdminDashboard } from '@/types';

interface DashboardStatsProps {
  dashboard: AdminDashboard;
}

export default function DashboardStats({ dashboard }: DashboardStatsProps) {
  const t = useTranslations('admin.dashboard');

  const stats = [
    { label: t('totalOrders'), value: String(dashboard.total_orders) },
    { label: t('revenue'), value: formatPrice(dashboard.revenue_total, 'hr') },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white rounded-[--radius-md] shadow-sm p-4">
          <p className="text-sm text-text-mid">{stat.label}</p>
          <p className="text-2xl font-semibold text-text-dark mt-1">{stat.value}</p>
        </div>
      ))}
      {Object.entries(dashboard.orders_by_status).map(([status, count]) => (
        <div key={status} className="bg-white rounded-[--radius-md] shadow-sm p-4">
          <p className="text-sm text-text-mid capitalize">{status}</p>
          <p className="text-2xl font-semibold text-text-dark mt-1">{count}</p>
        </div>
      ))}
    </div>
  );
}
