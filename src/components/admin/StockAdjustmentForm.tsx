'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { adjustProductStock, updateAdminProduct } from '@/services/api/admin';
import { useAuthStore } from '@/stores/auth-store';

interface StockAdjustmentFormProps {
  productId: string;
  productName: string;
  currentStock: number;
  onClose: () => void;
  onUpdated: (id: string, newStock: number) => void;
}

export default function StockAdjustmentForm({
  productId,
  productName,
  currentStock,
  onClose,
  onUpdated,
}: StockAdjustmentFormProps) {
  const t = useTranslations('admin.products');
  const token = useAuthStore((state) => state.token);
  const [mode, setMode] = useState<'adjust' | 'set'>('adjust');
  const [adjustment, setAdjustment] = useState(0);
  const [absoluteValue, setAbsoluteValue] = useState(currentStock);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || saving) return;

    if (mode === 'adjust' && adjustment === 0) return;
    if (mode === 'set' && absoluteValue === currentStock) return;

    setSaving(true);
    setError(null);

    try {
      if (mode === 'adjust') {
        const result = await adjustProductStock(productId, adjustment, reason || 'Stock adjustment', token);
        onUpdated(productId, result.stock_quantity);
      } else {
        await updateAdminProduct(productId, { stock_quantity: absoluteValue }, token);
        onUpdated(productId, absoluteValue);
      }
      onClose();
    } catch {
      setError(t('stockError'));
    } finally {
      setSaving(false);
    }
  }

  const previewStock = mode === 'adjust' ? currentStock + adjustment : absoluteValue;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-[--radius-md] shadow-lg p-6 w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-heading text-lg font-semibold text-text-dark mb-1">
          {t('adjustStock')}
        </h3>
        <p className="text-sm text-text-light mb-4">{productName}</p>

        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setMode('adjust')}
            className={`px-3 py-1.5 text-sm rounded-[--radius-sm] font-medium transition-colors cursor-pointer ${
              mode === 'adjust' ? 'bg-teal-deep text-white' : 'bg-gray-100 text-text-mid'
            }`}
          >
            {t('addRemove')}
          </button>
          <button
            type="button"
            onClick={() => setMode('set')}
            className={`px-3 py-1.5 text-sm rounded-[--radius-sm] font-medium transition-colors cursor-pointer ${
              mode === 'set' ? 'bg-teal-deep text-white' : 'bg-gray-100 text-text-mid'
            }`}
          >
            {t('setAbsolute')}
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="block text-sm text-text-mid mb-1">{t('currentStock')}</label>
            <div className="text-lg font-semibold text-text-dark">{currentStock}</div>
          </div>

          {mode === 'adjust' ? (
            <div className="mb-3">
              <label className="block text-sm text-text-mid mb-1">{t('adjustment')}</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustment((v) => v - 1)}
                  className="w-10 h-10 flex items-center justify-center rounded-[--radius-sm] bg-gray-100 text-text-dark font-bold text-lg hover:bg-gray-200 cursor-pointer"
                >
                  -
                </button>
                <input
                  type="number"
                  value={adjustment}
                  onChange={(e) => setAdjustment(Number(e.target.value))}
                  className="w-20 px-2 py-2 border border-gray-200 rounded-[--radius-sm] text-center text-sm"
                />
                <button
                  type="button"
                  onClick={() => setAdjustment((v) => v + 1)}
                  className="w-10 h-10 flex items-center justify-center rounded-[--radius-sm] bg-gray-100 text-text-dark font-bold text-lg hover:bg-gray-200 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-3">
              <label className="block text-sm text-text-mid mb-1">{t('newStock')}</label>
              <input
                type="number"
                min="0"
                value={absoluteValue}
                onChange={(e) => setAbsoluteValue(Math.max(0, Number(e.target.value)))}
                className="w-full px-3 py-2 border border-gray-200 rounded-[--radius-sm] text-sm"
              />
            </div>
          )}

          {mode === 'adjust' && (
            <div className="mb-3">
              <label className="block text-sm text-text-mid mb-1">{t('reason')}</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t('reasonPlaceholder')}
                className="w-full px-3 py-2 border border-gray-200 rounded-[--radius-sm] text-sm"
              />
            </div>
          )}

          <div className="mb-4 p-3 rounded-[--radius-sm] bg-gray-50">
            <span className="text-sm text-text-mid">{t('newStock')}: </span>
            <span className={`text-lg font-semibold ${previewStock <= 0 ? 'text-red-600' : 'text-text-dark'}`}>
              {previewStock}
            </span>
          </div>

          {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-text-mid hover:text-text-dark cursor-pointer"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={saving || (mode === 'adjust' && adjustment === 0) || (mode === 'set' && absoluteValue === currentStock)}
              className="px-4 py-2 text-sm bg-teal-deep text-white rounded-[--radius-sm] font-medium disabled:opacity-50 cursor-pointer"
            >
              {saving ? '...' : t('confirm')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
