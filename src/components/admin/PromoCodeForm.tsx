'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import Input from '@/components/ui/Input';
import type { AdminPromoCode } from '@/services/api/admin';

interface PromoCodeFormProps {
  code?: AdminPromoCode;
  onSave: (data: Omit<AdminPromoCode, 'id' | 'current_uses'>) => Promise<void>;
  onCancel: () => void;
}

export default function PromoCodeForm({ code, onSave, onCancel }: PromoCodeFormProps) {
  const t = useTranslations('admin.promoCodes');

  const [codeStr, setCodeStr] = useState(code?.code || '');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed' | 'free_shipping'>(code?.discount_type || 'percentage');
  const [value, setValue] = useState(String(code?.value || 0));
  const [minOrder, setMinOrder] = useState(code?.min_order_amount ? String(code.min_order_amount) : '');
  const [maxUses, setMaxUses] = useState(code?.max_uses ? String(code.max_uses) : '');
  const [active, setActive] = useState(code?.active ?? true);
  const [expiresAt, setExpiresAt] = useState(code?.expires_at?.split('T')[0] || '');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        code: codeStr.trim().toUpperCase(),
        discount_type: discountType,
        value: Number(value),
        min_order_amount: minOrder ? Number(minOrder) : null,
        max_uses: maxUses ? Number(maxUses) : null,
        active,
        expires_at: expiresAt || null,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label={t('code')}
        value={codeStr}
        onChange={(e) => setCodeStr(e.target.value)}
        required
      />
      <div>
        <label className="block text-sm font-medium text-text-dark mb-1.5">{t('type')}</label>
        <select
          value={discountType}
          onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed' | 'free_shipping')}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-[--radius-sm] bg-white text-text-dark text-sm"
        >
          <option value="percentage">{t('percentage')}</option>
          <option value="fixed">{t('fixedAmount')}</option>
          <option value="free_shipping">{t('freeShipping')}</option>
        </select>
      </div>
      {discountType !== 'free_shipping' && (
        <Input
          label={t('value')}
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          required
        />
      )}
      <Input
        label={t('minOrder')}
        type="number"
        value={minOrder}
        onChange={(e) => setMinOrder(e.target.value)}
      />
      <Input
        label={t('maxUses')}
        type="number"
        value={maxUses}
        onChange={(e) => setMaxUses(e.target.value)}
      />
      <Input
        label={t('expiresAt')}
        type="date"
        value={expiresAt}
        onChange={(e) => setExpiresAt(e.target.value)}
      />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="accent-teal-deep" />
        <span className="text-text-mid">{t('active')}</span>
      </label>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 bg-teal-deep text-white font-semibold py-3 px-6 rounded-[--radius-md] hover:bg-teal transition-colors cursor-pointer disabled:opacity-50 text-sm"
        >
          {saving ? '...' : t('save')}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-gray-200 rounded-[--radius-md] text-text-mid hover:text-text-dark transition-colors cursor-pointer text-sm"
        >
          {t('cancel')}
        </button>
      </div>
    </form>
  );
}
