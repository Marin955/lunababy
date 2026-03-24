'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { formatPrice } from '@/lib/utils';
import { updateAdminBundle } from '@/services/api/admin';
import { useAuthStore } from '@/stores/auth-store';
import type { AdminBundle } from '@/services/api/admin';

interface AdminBundlesTableProps {
  bundles: AdminBundle[];
  onUpdated: (updated: AdminBundle) => void;
}

export default function AdminBundlesTable({ bundles, onUpdated }: AdminBundlesTableProps) {
  const t = useTranslations('admin.bundles');
  const token = useAuthStore((state) => state.token);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ stock_quantity: number; active: boolean }>({ stock_quantity: 0, active: true });

  function startEdit(bundle: AdminBundle) {
    setEditingId(bundle.id);
    setEditValues({ stock_quantity: bundle.stock_quantity, active: bundle.active });
  }

  async function saveEdit(id: string) {
    if (!token) return;
    const updated = await updateAdminBundle(id, editValues, token);
    onUpdated(updated);
    setEditingId(null);
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left px-4 py-3 text-text-mid font-medium">{t('name')}</th>
            <th className="text-right px-4 py-3 text-text-mid font-medium">{t('price')}</th>
            <th className="text-right px-4 py-3 text-text-mid font-medium">{t('stock')}</th>
            <th className="text-center px-4 py-3 text-text-mid font-medium">{t('active')}</th>
            <th className="text-right px-4 py-3 text-text-mid font-medium">{t('actions')}</th>
          </tr>
        </thead>
        <tbody>
          {bundles.map((bundle) => (
            <tr key={bundle.id} className="border-b border-gray-50">
              <td className="px-4 py-3">
                <div className="font-medium text-text-dark">{bundle.name_hr}</div>
                <div className="text-xs text-text-light">{bundle.slug}</div>
              </td>
              <td className="px-4 py-3 text-right">{formatPrice(bundle.price, 'hr')}</td>
              <td className="px-4 py-3 text-right">
                {editingId === bundle.id ? (
                  <input
                    type="number"
                    value={editValues.stock_quantity}
                    onChange={(e) => setEditValues((prev) => ({ ...prev, stock_quantity: Number(e.target.value) }))}
                    className="w-20 px-2 py-1 border border-gray-200 rounded text-right text-sm"
                  />
                ) : (
                  <span className={bundle.stock_quantity <= bundle.low_stock_threshold ? 'text-red-600 font-semibold' : ''}>
                    {bundle.stock_quantity}
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-center">
                {editingId === bundle.id ? (
                  <input
                    type="checkbox"
                    checked={editValues.active}
                    onChange={(e) => setEditValues((prev) => ({ ...prev, active: e.target.checked }))}
                    className="accent-teal-deep"
                  />
                ) : (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${bundle.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                    {bundle.active ? t('yes') : t('no')}
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-right">
                {editingId === bundle.id ? (
                  <div className="flex gap-2 justify-end">
                    <button type="button" onClick={() => saveEdit(bundle.id)} className="text-xs text-teal-deep font-medium cursor-pointer">
                      {t('save')}
                    </button>
                    <button type="button" onClick={() => setEditingId(null)} className="text-xs text-text-light cursor-pointer">
                      {t('cancel')}
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => startEdit(bundle)} className="text-xs text-teal-deep font-medium cursor-pointer">
                    {t('edit')}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
