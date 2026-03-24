'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { formatPrice } from '@/lib/utils';
import type { Order } from '@/types';

interface OrderDetailProps {
  order: Order;
  locale: string;
}

export default function OrderDetail({ order, locale }: OrderDetailProps) {
  const t = useTranslations('orders');

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-indigo-100 text-indigo-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-heading text-xl font-semibold text-text-dark">
            {t('orderNumber')}: {order.order_number}
          </h2>
          <p className="text-sm text-text-mid mt-1">
            {new Date(order.created_at).toLocaleDateString(locale === 'hr' ? 'hr-HR' : 'en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
          {t(`status${order.status.charAt(0).toUpperCase() + order.status.slice(1)}`)}
        </span>
      </div>

      {/* Items */}
      <div className="bg-gray-50 rounded-[--radius-md] p-4">
        <h3 className="font-semibold text-text-dark text-sm mb-3">{t('items')}</h3>
        <div className="space-y-2">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span className="text-text-mid">
                {item.bundle_name} &times; {item.quantity}
              </span>
              <span className="font-medium text-text-dark">
                {formatPrice(item.line_total, locale)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="border-t border-gray-100 pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-text-mid">{t('subtotal')}</span>
          <span className="text-text-dark">{formatPrice(order.subtotal, locale)}</span>
        </div>
        {order.discount_amount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-green-600">{t('discount')}</span>
            <span className="text-green-600">-{formatPrice(order.discount_amount, locale)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-text-mid">{t('shipping')}</span>
          <span className="text-text-dark">
            {order.shipping_cost === 0 ? t('free') : formatPrice(order.shipping_cost, locale)}
          </span>
        </div>
        <div className="flex justify-between font-semibold pt-2 border-t border-gray-100">
          <span className="text-text-dark">{t('total')}</span>
          <span className="text-teal-deep text-lg">{formatPrice(order.total, locale)}</span>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="bg-gray-50 rounded-[--radius-md] p-4">
        <h3 className="font-semibold text-text-dark text-sm mb-2">{t('shippingAddress')}</h3>
        <div className="text-sm text-text-mid space-y-1">
          <p>{order.shipping_address.first_name} {order.shipping_address.last_name}</p>
          <p>{order.shipping_address.street}</p>
          <p>{order.shipping_address.postal_code} {order.shipping_address.city}</p>
          <p>{order.shipping_address.phone}</p>
          {order.shipping_address.company && <p>{order.shipping_address.company}</p>}
        </div>
      </div>

      {/* Shipment / Tracking */}
      {order.shipment && (
        <div className="bg-teal-pale/30 border border-teal/20 rounded-[--radius-md] p-4">
          <h3 className="font-semibold text-teal-deep text-sm mb-2">{t('tracking')}</h3>
          <div className="text-sm space-y-1">
            <p className="text-text-mid">
              {order.shipment.carrier}: <span className="font-medium text-text-dark">{order.shipment.tracking_number}</span>
            </p>
            {order.shipment.tracking_url && (
              <a
                href={order.shipment.tracking_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-deep hover:text-teal font-medium underline"
              >
                {t('trackPackage')}
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
