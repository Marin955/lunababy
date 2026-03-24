'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/auth-store';
import { fetchDashboard } from '@/services/api/admin';
import AdminGuard from '@/components/auth/AdminGuard';
import AdminNav from '@/components/admin/AdminNav';
import DashboardStats from '@/components/admin/DashboardStats';
import RecentOrdersTable from '@/components/admin/RecentOrdersTable';
import LowStockAlerts from '@/components/admin/LowStockAlerts';
import type { AdminDashboard } from '@/types';

function DashboardContent() {
  const t = useTranslations('admin.dashboard');
  const token = useAuthStore((state) => state.token);
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetchDashboard(token)
      .then(setDashboard)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-[--radius-md]" />)}
        </div>
        <div className="h-64 bg-gray-100 rounded-[--radius-md]" />
      </div>
    );
  }

  if (!dashboard) return <p className="text-text-mid">{t('loadError')}</p>;

  return (
    <>
      <h1 className="font-heading text-3xl font-semibold text-text-dark mb-6">{t('title')}</h1>
      <DashboardStats dashboard={dashboard} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentOrdersTable orders={dashboard.recent_orders} />
        </div>
        <div>
          <LowStockAlerts bundles={dashboard.low_stock_bundles} />
        </div>
      </div>
    </>
  );
}

export default function AdminDashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <AdminGuard>
        <AdminNav />
        <DashboardContent />
      </AdminGuard>
    </div>
  );
}
