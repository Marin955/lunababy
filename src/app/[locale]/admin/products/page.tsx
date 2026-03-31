'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/auth-store';
import { fetchAdminProducts } from '@/services/api/admin';
import AdminGuard from '@/components/auth/AdminGuard';
import AdminNav from '@/components/admin/AdminNav';
import AdminProductsTable from '@/components/admin/AdminProductsTable';
import type { AdminProduct } from '@/types';

function ProductsContent() {
  const t = useTranslations('admin.products');
  const token = useAuthStore((state) => state.token);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetchAdminProducts(token)
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  function handleStockUpdated(productId: string, newStock: number) {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock_quantity: newStock } : p))
    );
  }

  function handleProductUpdated(updated: AdminProduct) {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }

  return (
    <>
      <h1 className="font-heading text-3xl font-semibold text-text-dark mb-6">{t('title')}</h1>
      {loading ? (
        <div className="animate-pulse h-64 bg-gray-100 rounded-[--radius-md]" />
      ) : (
        <div className="bg-white rounded-[--radius-md] shadow-sm">
          <AdminProductsTable products={products} onStockUpdated={handleStockUpdated} onProductUpdated={handleProductUpdated} />
        </div>
      )}
    </>
  );
}

export default function AdminProductsPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <AdminGuard>
        <AdminNav />
        <ProductsContent />
      </AdminGuard>
    </div>
  );
}
