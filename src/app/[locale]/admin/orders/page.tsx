'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/auth-store';
import { fetchAdminOrders } from '@/services/api/admin';
import AdminGuard from '@/components/auth/AdminGuard';
import AdminNav from '@/components/admin/AdminNav';
import AdminOrdersTable from '@/components/admin/AdminOrdersTable';
import type { Order, PaginationMeta } from '@/types';

const statuses = ['', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

function OrdersContent() {
  const t = useTranslations('admin.orders');
  const token = useAuthStore((state) => state.token);

  const [orders, setOrders] = useState<Order[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetchAdminOrders({ page, status: status || undefined, search: search || undefined }, token)
      .then((res) => {
        setOrders(res.data);
        setMeta(res.meta);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token, page, status, search]);

  return (
    <>
      <h1 className="font-heading text-3xl font-semibold text-text-dark mb-6">{t('title')}</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="px-4 py-2 border border-gray-200 rounded-[--radius-sm] text-sm bg-white"
        >
          <option value="">{t('allStatuses')}</option>
          {statuses.filter(Boolean).map((s) => (
            <option key={s} value={s} className="capitalize">{s}</option>
          ))}
        </select>
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder={t('searchPlaceholder')}
          className="flex-1 min-w-[200px] px-4 py-2 border border-gray-200 rounded-[--radius-sm] text-sm bg-white"
        />
      </div>

      {loading ? (
        <div className="animate-pulse h-64 bg-gray-100 rounded-[--radius-md]" />
      ) : (
        <div className="bg-white rounded-[--radius-md] shadow-sm">
          <AdminOrdersTable orders={orders} />
        </div>
      )}

      {meta && meta.total_pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: meta.total_pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPage(p)}
              className={`w-10 h-10 rounded-full text-sm font-medium cursor-pointer ${
                p === page ? 'bg-teal-deep text-white' : 'bg-gray-100 text-text-mid hover:bg-gray-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

export default function AdminOrdersPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <AdminGuard>
        <AdminNav />
        <OrdersContent />
      </AdminGuard>
    </div>
  );
}
