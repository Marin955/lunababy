'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/auth-store';
import { fetchAdminPromoCodes, createAdminPromoCode, updateAdminPromoCode } from '@/services/api/admin';
import AdminGuard from '@/components/auth/AdminGuard';
import AdminNav from '@/components/admin/AdminNav';
import AdminPromoTable from '@/components/admin/AdminPromoTable';
import PromoCodeForm from '@/components/admin/PromoCodeForm';
import type { AdminPromoCode } from '@/services/api/admin';

function PromoCodesContent() {
  const t = useTranslations('admin.promoCodes');
  const token = useAuthStore((state) => state.token);
  const [codes, setCodes] = useState<AdminPromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCode, setEditingCode] = useState<AdminPromoCode | null>(null);

  useEffect(() => {
    if (!token) return;
    fetchAdminPromoCodes(token)
      .then(setCodes)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  async function handleSave(data: Omit<AdminPromoCode, 'id' | 'current_uses'>) {
    if (!token) return;
    if (editingCode) {
      const updated = await updateAdminPromoCode(editingCode.id, data, token);
      setCodes((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    } else {
      const created = await createAdminPromoCode(data, token);
      setCodes((prev) => [...prev, created]);
    }
    setShowForm(false);
    setEditingCode(null);
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-3xl font-semibold text-text-dark">{t('title')}</h1>
        {!showForm && (
          <button
            type="button"
            onClick={() => { setEditingCode(null); setShowForm(true); }}
            className="text-sm bg-teal-deep text-white font-semibold py-2 px-4 rounded-[--radius-sm] hover:bg-teal transition-colors cursor-pointer"
          >
            {t('create')}
          </button>
        )}
      </div>

      {showForm ? (
        <div className="bg-white rounded-[--radius-lg] shadow-sm p-6 mb-6">
          <PromoCodeForm
            code={editingCode || undefined}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditingCode(null); }}
          />
        </div>
      ) : null}

      {loading ? (
        <div className="animate-pulse h-64 bg-gray-100 rounded-[--radius-md]" />
      ) : (
        <div className="bg-white rounded-[--radius-md] shadow-sm">
          <AdminPromoTable codes={codes} onEdit={(code) => { setEditingCode(code); setShowForm(true); }} />
        </div>
      )}
    </>
  );
}

export default function AdminPromoCodesPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <AdminGuard>
        <AdminNav />
        <PromoCodesContent />
      </AdminGuard>
    </div>
  );
}
