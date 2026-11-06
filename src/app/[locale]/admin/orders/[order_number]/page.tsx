'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { fetchAdminOrder, updateOrderStatus, createShipment } from '@/services/api/admin';
import AdminGuard from '@/components/auth/AdminGuard';
import AdminNav from '@/components/admin/AdminNav';
import OrderDetail from '@/components/orders/OrderDetail';
import StatusTransitionButton from '@/components/admin/StatusTransitionButton';
import CreateShipmentForm from '@/components/admin/CreateShipmentForm';
import type { Order } from '@/types';
import { providerLabel } from '@/components/checkout/pickup/providers';

function OrderDetailContent() {
  const t = useTranslations('admin.orders');
  const params = useParams();
  const orderNumber = params.order_number as string;
  const token = useAuthStore((state) => state.token);

  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !orderNumber) return;
    fetchAdminOrder(orderNumber, token)
      .then((raw) => setOrder(normalizeAdminOrder(raw)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token, orderNumber]);

  async function handleStatusChange(newStatus: string) {
    if (!token || !orderNumber) return;
    const updated = await updateOrderStatus(orderNumber, newStatus, token);
    setOrder((prev) => normalizeAdminOrder(updated, prev));
  }

  async function handleShipment(carrier: string, trackingNumber: string) {
    if (!token || !orderNumber) return;
    const updated = await createShipment(orderNumber, { carrier, tracking_number: trackingNumber }, token);
    setOrder((prev) => normalizeAdminOrder(updated, prev));
  }

  if (loading) {
    return <div className="animate-pulse h-64 bg-gray-100 rounded-[--radius-md]" />;
  }

  if (!order) {
    return <p className="text-text-mid">{t('orderNotFound')}</p>;
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-semibold text-text-dark">
          {t('orderDetail')}: {order.order_number}
        </h1>
        <StatusTransitionButton currentStatus={order.status} onTransition={handleStatusChange} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[--radius-lg] shadow-sm p-6">
            <OrderDetail order={order} locale="hr" />
          </div>
        </div>
        <div className="space-y-6">
          <AdminPickupPoint order={order} />
          {!order.shipment && (order.status === 'processing' || order.status === 'confirmed') && (
            <div className="bg-white rounded-[--radius-lg] shadow-sm p-6">
              <CreateShipmentForm onSubmit={handleShipment} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// The admin API returns raw order columns (order_items, shipping_*,
// pickup_point_*) rather than the public OrderSerializer shape, and the
// status/shipment endpoints leave out the items. Map it to `Order` here,
// keeping what the previous response had.
type AdminOrder = Order & {
  order_items?: Order['items'];
  shipping_first_name?: string;
  shipping_last_name?: string;
  shipping_street?: string;
  shipping_city?: string;
  shipping_postal_code?: string;
  shipping_phone?: string;
  shipping_company?: string | null;
  pickup_point_provider?: string | null;
  pickup_point_id?: string | null;
  pickup_point_name?: string | null;
  pickup_point_address?: string | null;
};

function normalizeAdminOrder(raw: Order, prev?: AdminOrder | null): AdminOrder {
  const order = raw as AdminOrder;
  return {
    ...prev,
    ...order,
    items: order.items ?? order.order_items ?? prev?.items ?? [],
    shipping_address:
      order.shipping_address ??
      (order.shipping_street !== undefined
        ? {
            first_name: order.shipping_first_name ?? '',
            last_name: order.shipping_last_name ?? '',
            street: order.shipping_street ?? '',
            city: order.shipping_city ?? '',
            postal_code: order.shipping_postal_code ?? '',
            phone: order.shipping_phone ?? '',
            company: order.shipping_company ?? null,
          }
        : prev?.shipping_address) ??
      ({} as Order['shipping_address']),
    shipment: order.shipment !== undefined ? order.shipment : prev?.shipment ?? null,
  };
}

function AdminPickupPoint({ order }: { order: AdminOrder }) {
  const t = useTranslations('checkout.pickup');
  const point =
    order.pickup_point ??
    (order.pickup_point_id
      ? {
          provider: order.pickup_point_provider ?? '',
          id: order.pickup_point_id,
          name: order.pickup_point_name ?? order.pickup_point_id,
          address: order.pickup_point_address ?? null,
        }
      : null);
  if (!point) return null;

  return (
    <section className="bg-white rounded-[--radius-lg] shadow-sm p-6">
      <h2 className="font-heading text-lg font-semibold text-text-dark mb-3">
        {t('selected', { provider: providerLabel(point.provider) })}
      </h2>
      <p className="text-base text-text-dark">{point.name}</p>
      {point.address && <p className="text-sm text-text-mid">{point.address}</p>}
      <p className="text-sm text-text-mid mt-1">{t('code', { code: point.id })}</p>
    </section>
  );
}

export default function AdminOrderDetailPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <AdminGuard>
        <AdminNav />
        <OrderDetailContent />
      </AdminGuard>
    </div>
  );
}
