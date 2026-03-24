'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { formatPrice } from '@/lib/utils';
import type { AdminPromoCode } from '@/services/api/admin';

interface AdminPromoTableProps {
  codes: AdminPromoCode[];
  onEdit: (code: AdminPromoCode) => void;
}

export default function AdminPromoTable({ codes, onEdit }: AdminPromoTableProps) {
  const t = useTranslations('admin.promoCodes');

  if (codes.length === 0) {
    return <p className="text-text-mid text-sm py-4">{t('noCodes')}</p>;
  }

  function formatValue(code: AdminPromoCode): string {
    switch (code.discount_type) {
      case 'percentage': return `${code.value}%`;
      case 'fixed': return formatPrice(code.value, 'hr');
      case 'free_shipping': return t('freeShipping');
      default: return String(code.value);
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left px-4 py-3 text-text-mid font-medium">{t('code')}</th>
            <th className="text-left px-4 py-3 text-text-mid font-medium">{t('type')}</th>
            <th className="text-right px-4 py-3 text-text-mid font-medium">{t('value')}</th>
            <th className="text-right px-4 py-3 text-text-mid font-medium">{t('uses')}</th>
            <th className="text-center px-4 py-3 text-text-mid font-medium">{t('active')}</th>
            <th className="text-right px-4 py-3 text-text-mid font-medium">{t('actions')}</th>
          </tr>
        </thead>
        <tbody>
          {codes.map((code) => (
            <tr key={code.id} className="border-b border-gray-50">
              <td className="px-4 py-3 font-mono font-medium">{code.code}</td>
              <td className="px-4 py-3 text-text-mid capitalize">{code.discount_type.replace('_', ' ')}</td>
              <td className="px-4 py-3 text-right">{formatValue(code)}</td>
              <td className="px-4 py-3 text-right">{code.current_uses}{code.max_uses ? ` / ${code.max_uses}` : ''}</td>
              <td className="px-4 py-3 text-center">
                <span className={`text-xs px-2 py-0.5 rounded-full ${code.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                  {code.active ? t('yes') : t('no')}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <button type="button" onClick={() => onEdit(code)} className="text-xs text-teal-deep font-medium cursor-pointer">
                  {t('edit')}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
