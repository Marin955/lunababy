'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/auth-store';
import { fetchAdminBundles } from '@/services/api/admin';
import AdminGuard from '@/components/auth/AdminGuard';
import AdminNav from '@/components/admin/AdminNav';
import AdminBundlesTable from '@/components/admin/AdminBundlesTable';
import type { AdminBundle } from '@/services/api/admin';

function BundlesContent() {
  const t = useTranslations('admin.bundles');
  const token = useAuthStore((state) => state.token);
  const [bundles, setBundles] = useState<AdminBundle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetchAdminBundles(token)
      .then(setBundles)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  function handleUpdated(updated: AdminBundle) {
    setBundles((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  }

  return (
    <>
      <h1 className="font-heading text-3xl font-semibold text-text-dark mb-6">{t('title')}</h1>
      {loading ? (
        <div className="animate-pulse h-64 bg-gray-100 rounded-[--radius-md]" />
      ) : (
        <div className="bg-white rounded-[--radius-md] shadow-sm">
          <AdminBundlesTable bundles={bundles} onUpdated={handleUpdated} />
        </div>
      )}
    </>
  );
}

export default function AdminBundlesPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <AdminGuard>
        <AdminNav />
        <BundlesContent />
      </AdminGuard>
    </div>
  );
}
