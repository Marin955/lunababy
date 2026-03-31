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

interface EditValues {
  price: number;
  discount_percent: number;
  active: boolean;
}

export default function AdminBundlesTable({ bundles, onUpdated }: AdminBundlesTableProps) {
  const t = useTranslations('admin.bundles');
  const token = useAuthStore((state) => state.token);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<EditValues>({ price: 0, discount_percent: 0, active: true });
  const [saving, setSaving] = useState(false);

  function startEdit(bundle: AdminBundle) {
    setEditingId(bundle.id);
    setEditValues({
      price: bundle.original_price ?? bundle.price,
      discount_percent: bundle.discount_percent,
      active: bundle.active,
    });
  }

  function computeSalePrice(): number {
    if (editValues.discount_percent > 0) {
      return Math.round(editValues.price * (100 - editValues.discount_percent) / 100);
    }
    return editValues.price;
  }

  async function saveEdit(id: string) {
    if (!token || saving) return;
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        active: editValues.active,
        discount_percent: editValues.discount_percent,
      };
      if (editValues.discount_percent > 0) {
        payload.original_price = editValues.price;
        payload.price = computeSalePrice();
      } else {
        payload.price = editValues.price;
        payload.original_price = null;
      }
      const updated = await updateAdminBundle(id, payload, token);
      onUpdated(updated);
      setEditingId(null);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left px-4 py-3 text-text-mid font-medium">{t('name')}</th>
            <th className="text-right px-4 py-3 text-text-mid font-medium">{t('price')}</th>
            <th className="text-right px-4 py-3 text-text-mid font-medium">{t('discount')}</th>
            <th className="text-right px-4 py-3 text-text-mid font-medium">{t('salePrice')}</th>
            <th className="text-right px-4 py-3 text-text-mid font-medium">{t('stock')}</th>
            <th className="text-center px-4 py-3 text-text-mid font-medium">{t('active')}</th>
            <th className="text-right px-4 py-3 text-text-mid font-medium">{t('actions')}</th>
          </tr>
        </thead>
        <tbody>
          {bundles.map((bundle) => {
            const isEditing = editingId === bundle.id;
            const basePrice = bundle.original_price ?? bundle.price;
            return (
              <tr key={bundle.id} className="border-b border-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-text-dark">{bundle.name_hr}</div>
                  <div className="text-xs text-text-light">{bundle.slug}</div>
                </td>

                <td className="px-4 py-3 text-right">
                  {isEditing ? (
                    <div className="flex items-center justify-end gap-1">
                      <input
                        type="number"
                        step="1"
                        min="0"
                        value={(editValues.price / 100).toFixed(2)}
                        onChange={(e) => setEditValues((prev) => ({ ...prev, price: Math.round(Number(e.target.value) * 100) }))}
                        className="w-24 px-2 py-1 border border-gray-200 rounded text-right text-sm"
                      />
                      <span className="text-xs text-text-light">EUR</span>
                    </div>
                  ) : (
                    formatPrice(basePrice, 'hr')
                  )}
                </td>

                <td className="px-4 py-3 text-right">
                  {isEditing ? (
                    <div className="flex items-center justify-end gap-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editValues.discount_percent}
                        onChange={(e) => setEditValues((prev) => ({ ...prev, discount_percent: Math.min(100, Math.max(0, Number(e.target.value))) }))}
                        className="w-16 px-2 py-1 border border-gray-200 rounded text-right text-sm"
                      />
                      <span className="text-xs text-text-light">%</span>
                    </div>
                  ) : (
                    bundle.discount_percent > 0 ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">
                        -{bundle.discount_percent}%
                      </span>
                    ) : (
                      <span className="text-text-light">-</span>
                    )
                  )}
                </td>

                <td className="px-4 py-3 text-right">
                  {isEditing ? (
                    <span className={editValues.discount_percent > 0 ? 'text-red-600 font-semibold' : 'text-text-dark'}>
                      {formatPrice(computeSalePrice(), 'hr')}
                    </span>
                  ) : (
                    <span className={bundle.discount_percent > 0 ? 'text-red-600 font-semibold' : ''}>
                      {formatPrice(bundle.price, 'hr')}
                    </span>
                  )}
                </td>

                {/* Computed stock (read-only) */}
                <td className="px-4 py-3 text-right">
                  <span className={bundle.computed_stock_quantity <= 5 ? 'text-red-600 font-semibold' : ''}>
                    {bundle.computed_stock_quantity}
                  </span>
                  <span className="text-xs text-text-light ml-1">(auto)</span>
                </td>

                <td className="px-4 py-3 text-center">
                  {isEditing ? (
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
                  {isEditing ? (
                    <div className="flex gap-2 justify-end">
                      <button type="button" onClick={() => saveEdit(bundle.id)} disabled={saving} className="text-xs text-teal-deep font-medium cursor-pointer disabled:opacity-50">
                        {saving ? '...' : t('save')}
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
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
