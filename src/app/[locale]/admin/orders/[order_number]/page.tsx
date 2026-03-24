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

function OrderDetailContent() {
  const t = useTranslations('admin.orders');
  const params = useParams();
  const orderNumber = params.order_number as string;
  const token = useAuthStore((state) => state.token);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !orderNumber) return;
    fetchAdminOrder(orderNumber, token)
      .then(setOrder)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token, orderNumber]);

  async function handleStatusChange(newStatus: string) {
    if (!token || !orderNumber) return;
    const updated = await updateOrderStatus(orderNumber, newStatus, token);
    setOrder(updated);
  }

  async function handleShipment(carrier: string, trackingNumber: string) {
    if (!token || !orderNumber) return;
    const updated = await createShipment(orderNumber, { carrier, tracking_number: trackingNumber }, token);
    setOrder(updated);
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
        <div>
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
