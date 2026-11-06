'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { formatPrice } from '@/lib/utils';
import { updateAdminProduct } from '@/services/api/admin';
import { useAuthStore } from '@/stores/auth-store';
import type { AdminProduct } from '@/types';
import StockAdjustmentForm from './StockAdjustmentForm';

interface AdminProductsTableProps {
  products: AdminProduct[];
  onStockUpdated: (productId: string, newStock: number) => void;
  onProductUpdated: (product: AdminProduct) => void;
}

interface EditFields {
  name_hr: string;
  name_en: string;
  description_hr: string;
  description_en: string;
  low_stock_threshold: number;
  // Catalog specs (owner input). Certifications are edited as a comma-separated string.
  brand: string;
  material_hr: string;
  material_en: string;
  dimensions: string;
  age_range_hr: string;
  age_range_en: string;
  certifications: string;
  care_instructions_hr: string;
  care_instructions_en: string;
}

const EMPTY_FIELDS: EditFields = {
  name_hr: '', name_en: '', description_hr: '', description_en: '', low_stock_threshold: 5,
  brand: '', material_hr: '', material_en: '', dimensions: '', age_range_hr: '', age_range_en: '',
  certifications: '', care_instructions_hr: '', care_instructions_en: '',
};

type SpecField = Exclude<keyof EditFields, 'name_hr' | 'name_en' | 'description_hr' | 'description_en' | 'low_stock_threshold'>;

// Spec inputs in the edit form: [field, label key, multiline]
const SPEC_INPUTS: [SpecField, string, boolean][] = [
  ['brand', 'brand', false],
  ['dimensions', 'dimensions', false],
  ['material_hr', 'materialHr', true],
  ['material_en', 'materialEn', true],
  ['age_range_hr', 'ageRangeHr', false],
  ['age_range_en', 'ageRangeEn', false],
  ['certifications', 'certifications', false],
  ['care_instructions_hr', 'careHr', true],
  ['care_instructions_en', 'careEn', true],
];

function parseCertifications(value: string): string[] {
  return Array.from(new Set(value.split(',').map((c) => c.trim()).filter(Boolean)));
}

/** Read-only spec rows for the expanded product, skipping empty values. */
function specRows(product: AdminProduct, t: (key: string) => string): [string, string][] {
  const rows: [string, string | null][] = [
    [t('brand'), product.brand],
    [t('dimensions'), product.dimensions],
    [t('materialHr'), product.material_hr],
    [t('materialEn'), product.material_en],
    [t('ageRangeHr'), product.age_range_hr],
    [t('ageRangeEn'), product.age_range_en],
    [t('certifications'), product.certifications?.length ? product.certifications.join(', ') : null],
    [t('careHr'), product.care_instructions_hr],
    [t('careEn'), product.care_instructions_en],
  ];
  return rows.filter((row): row is [string, string] => Boolean(row[1]));
}

export default function AdminProductsTable({ products, onStockUpdated, onProductUpdated }: AdminProductsTableProps) {
  const t = useTranslations('admin.products');
  const token = useAuthStore((state) => state.token);
  const [adjustingProduct, setAdjustingProduct] = useState<AdminProduct | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFields, setEditFields] = useState<EditFields>(EMPTY_FIELDS);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  function startEdit(product: AdminProduct) {
    setEditingId(product.id);
    setEditFields({
      name_hr: product.name_hr,
      name_en: product.name_en,
      description_hr: product.description_hr || '',
      description_en: product.description_en || '',
      low_stock_threshold: product.low_stock_threshold,
      brand: product.brand || '',
      material_hr: product.material_hr || '',
      material_en: product.material_en || '',
      dimensions: product.dimensions || '',
      age_range_hr: product.age_range_hr || '',
      age_range_en: product.age_range_en || '',
      certifications: (product.certifications || []).join(', '),
      care_instructions_hr: product.care_instructions_hr || '',
      care_instructions_en: product.care_instructions_en || '',
    });
    setSaveError(false);
  }

  async function saveEdit(id: string) {
    if (!token || saving) return;
    setSaving(true);
    setSaveError(false);
    try {
      // Blank strings are stored as NULL by the API, so the storefront hides them.
      const payload = { ...editFields, certifications: parseCertifications(editFields.certifications) };
      const updated = await updateAdminProduct(id, payload, token);
      onProductUpdated(updated);
      setEditingId(null);
    } catch {
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="w-8 px-2 py-3"></th>
              <th className="text-left px-4 py-3 text-text-mid font-medium">{t('name')}</th>
              <th className="text-left px-4 py-3 text-text-mid font-medium">{t('sku')}</th>
              <th className="text-center px-4 py-3 text-text-mid font-medium">{t('sex')}</th>
              <th className="text-right px-4 py-3 text-text-mid font-medium">{t('stock')}</th>
              <th className="text-right px-4 py-3 text-text-mid font-medium">{t('threshold')}</th>
              <th className="text-left px-4 py-3 text-text-mid font-medium">{t('bundles')}</th>
              <th className="text-center px-4 py-3 text-text-mid font-medium">{t('status')}</th>
              <th className="text-right px-4 py-3 text-text-mid font-medium">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const isLowStock = product.stock_quantity <= product.low_stock_threshold;
              const isOutOfStock = product.stock_quantity === 0;
              const isExpanded = expandedId === product.id;
              const isEditing = editingId === product.id;

              return (
                <React.Fragment key={product.id}>
                  <tr className="border-b border-gray-50 cursor-pointer hover:bg-gray-50/50" onClick={() => setExpandedId(isExpanded ? null : product.id)}>
                    <td className="px-2 py-3 text-center">
                      <svg className={`w-4 h-4 text-text-light transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {product.image_path && (
                          <img src={product.image_path} alt={product.name_hr} className="w-10 h-10 rounded object-cover" />
                        )}
                        <div>
                          <div className="font-medium text-text-dark">{product.name_hr}</div>
                          {product.supplier_name && (
                            <div className="text-xs text-text-light">{product.supplier_name}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-text-light font-mono">{product.sku || '-'}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-text-mid">
                        {t(`sex_${product.sex}`)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-semibold ${isOutOfStock ? 'text-red-600' : isLowStock ? 'text-amber-600' : 'text-text-dark'}`}>
                        {product.stock_quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-text-light">
                      {product.low_stock_threshold}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {product.bundles.map((bundle) => (
                          <span key={bundle.id} className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                            {bundle.name_hr}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isOutOfStock ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">{t('outOfStock')}</span>
                      ) : isLowStock ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">{t('lowStock')}</span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 font-medium">{t('inStock')}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setAdjustingProduct(product)}
                        className="text-xs text-teal-deep font-medium cursor-pointer"
                      >
                        {t('adjustStock')}
                      </button>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr className="bg-gray-50/50">
                      <td colSpan={9} className="px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Left: Product info */}
                          <div className="space-y-3">
                            <h4 className="font-medium text-text-dark text-sm">{t('details')}</h4>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="text-text-light">{t('purchasePrice')}:</span>
                                <span className="ml-2 text-text-dark">{formatPrice(product.purchase_price, 'hr')}</span>
                              </div>
                              <div>
                                <span className="text-text-light">{t('purchasePriceVat')}:</span>
                                <span className="ml-2 text-text-dark">{formatPrice(product.purchase_price_with_vat, 'hr')}</span>
                              </div>
                              <div>
                                <span className="text-text-light">{t('msrp')}:</span>
                                <span className="ml-2 text-text-dark">{formatPrice(product.msrp, 'hr')}</span>
                              </div>
                              <div>
                                <span className="text-text-light">{t('supplier')}:</span>
                                {product.supplier_url ? (
                                  <a href={product.supplier_url} target="_blank" rel="noopener noreferrer" className="ml-2 text-teal-deep hover:underline">
                                    {product.supplier_name || t('viewSupplier')}
                                  </a>
                                ) : (
                                  <span className="ml-2 text-text-dark">{product.supplier_name || '-'}</span>
                                )}
                              </div>
                            </div>

                            {product.image_path && (
                              <img src={product.image_path} alt={product.name_hr} className="w-32 h-32 rounded-[--radius-sm] object-cover" />
                            )}
                          </div>

                          {/* Right: Edit form */}
                          <div className="space-y-3">
                            {isEditing ? (
                              <>
                                <h4 className="font-medium text-text-dark text-sm">{t('editProduct')}</h4>
                                <div className="space-y-2">
                                  <div>
                                    <label className="text-xs text-text-light">{t('nameHr')}</label>
                                    <input
                                      type="text"
                                      value={editFields.name_hr}
                                      onChange={(e) => setEditFields((p) => ({ ...p, name_hr: e.target.value }))}
                                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs text-text-light">{t('nameEn')}</label>
                                    <input
                                      type="text"
                                      value={editFields.name_en}
                                      onChange={(e) => setEditFields((p) => ({ ...p, name_en: e.target.value }))}
                                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs text-text-light">{t('descriptionHr')}</label>
                                    <textarea
                                      value={editFields.description_hr}
                                      onChange={(e) => setEditFields((p) => ({ ...p, description_hr: e.target.value }))}
                                      rows={2}
                                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs text-text-light">{t('descriptionEn')}</label>
                                    <textarea
                                      value={editFields.description_en}
                                      onChange={(e) => setEditFields((p) => ({ ...p, description_en: e.target.value }))}
                                      rows={2}
                                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs text-text-light">{t('threshold')}</label>
                                    <input
                                      type="number"
                                      min="0"
                                      value={editFields.low_stock_threshold}
                                      onChange={(e) => setEditFields((p) => ({ ...p, low_stock_threshold: Math.max(0, Number(e.target.value)) }))}
                                      className="w-24 px-2 py-1.5 border border-gray-200 rounded text-sm"
                                    />
                                  </div>
                                  <div className="pt-3 mt-3 border-t border-gray-200 space-y-2">
                                    <h5 className="font-medium text-text-dark text-sm">{t('specs')}</h5>
                                    <p className="text-xs text-text-mid">{t('specsHint')}</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      {SPEC_INPUTS.map(([field, labelKey, multiline]) => {
                                        const inputId = `product-${product.id}-${field}`;
                                        return (
                                          <div key={field}>
                                            <label htmlFor={inputId} className="text-xs text-text-mid">{t(labelKey)}</label>
                                            {multiline ? (
                                              <textarea
                                                id={inputId}
                                                value={editFields[field]}
                                                onChange={(e) => setEditFields((p) => ({ ...p, [field]: e.target.value }))}
                                                rows={2}
                                                className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                                              />
                                            ) : (
                                              <input
                                                id={inputId}
                                                type="text"
                                                value={editFields[field]}
                                                onChange={(e) => setEditFields((p) => ({ ...p, [field]: e.target.value }))}
                                                className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                                              />
                                            )}
                                            {field === 'certifications' && (
                                              <p className="text-xs text-text-mid mt-0.5">{t('certificationsHint')}</p>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                  {saveError && (
                                    <p className="text-xs text-red-700" role="alert">{t('saveError')}</p>
                                  )}
                                  <div className="flex gap-2 pt-1">
                                    <button type="button" onClick={() => saveEdit(product.id)} disabled={saving} className="text-xs text-teal-deep font-medium cursor-pointer disabled:opacity-50">
                                      {saving ? '...' : t('save')}
                                    </button>
                                    <button type="button" onClick={() => setEditingId(null)} className="text-xs text-text-light cursor-pointer">
                                      {t('cancel')}
                                    </button>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium text-text-dark text-sm">{t('names')}</h4>
                                  <button type="button" onClick={() => startEdit(product)} className="text-xs text-teal-deep font-medium cursor-pointer">
                                    {t('edit')}
                                  </button>
                                </div>
                                <div className="space-y-1 text-sm">
                                  <div><span className="text-text-light">HR:</span> <span className="text-text-dark">{product.name_hr}</span></div>
                                  <div><span className="text-text-light">EN:</span> <span className="text-text-dark">{product.name_en}</span></div>
                                  {product.description_hr && (
                                    <p className="text-text-mid text-xs mt-2">{product.description_hr}</p>
                                  )}
                                </div>
                                <div className="pt-3 mt-3 border-t border-gray-200">
                                  <h4 className="font-medium text-text-dark text-sm mb-2">{t('specs')}</h4>
                                  {specRows(product, t).length > 0 ? (
                                    <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                                      {specRows(product, t).map(([label, value]) => (
                                        <React.Fragment key={label}>
                                          <dt className="text-text-mid">{label}</dt>
                                          <dd className="text-text-dark whitespace-pre-line">{value}</dd>
                                        </React.Fragment>
                                      ))}
                                    </dl>
                                  ) : (
                                    <p className="text-xs text-text-mid">{t('noSpecs')}</p>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {adjustingProduct && (
        <StockAdjustmentForm
          productId={adjustingProduct.id}
          productName={adjustingProduct.name_hr}
          currentStock={adjustingProduct.stock_quantity}
          onClose={() => setAdjustingProduct(null)}
          onUpdated={onStockUpdated}
        />
      )}
    </>
  );
}
