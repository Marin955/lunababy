import { api } from './client';
import type { AdminDashboard, Order, PaginatedResponse, Bundle } from '@/types';

// Dashboard
export async function fetchDashboard(token: string): Promise<AdminDashboard> {
  const res = await api.get<{ data: AdminDashboard }>('/admin/dashboard', { token });
  return res.data;
}

// Orders
export async function fetchAdminOrders(
  params: { page?: number; status?: string; search?: string },
  token: string
): Promise<PaginatedResponse<Order>> {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.status) query.set('status', params.status);
  if (params.search) query.set('search', params.search);
  return api.get<PaginatedResponse<Order>>(`/admin/orders?${query}`, { token });
}

export async function fetchAdminOrder(orderNumber: string, token: string): Promise<Order> {
  const res = await api.get<{ data: Order }>(`/admin/orders/${orderNumber}`, { token });
  return res.data;
}

export async function updateOrderStatus(
  orderNumber: string,
  status: string,
  token: string
): Promise<Order> {
  const res = await api.patch<{ data: Order }>(
    `/admin/orders/${orderNumber}/status`,
    { status },
    { token }
  );
  return res.data;
}

export async function createShipment(
  orderNumber: string,
  data: { carrier: string; tracking_number: string },
  token: string
): Promise<Order> {
  const res = await api.post<{ data: Order }>(
    `/admin/orders/${orderNumber}/shipment`,
    data,
    { token }
  );
  return res.data;
}

// Bundles
interface AdminBundle {
  id: string;
  slug: string;
  name_hr: string;
  name_en: string;
  price: number;
  original_price: number | null;
  stock_quantity: number;
  low_stock_threshold: number;
  active: boolean;
  badge: string | null;
  category: string;
}

export async function fetchAdminBundles(token: string): Promise<AdminBundle[]> {
  const res = await api.get<{ data: AdminBundle[] }>('/admin/bundles', { token });
  return res.data;
}

export async function updateAdminBundle(
  id: string,
  data: Partial<Pick<AdminBundle, 'price' | 'original_price' | 'stock_quantity' | 'low_stock_threshold' | 'active'>>,
  token: string
): Promise<AdminBundle> {
  const res = await api.patch<{ data: AdminBundle }>(`/admin/bundles/${id}`, data, { token });
  return res.data;
}

// Promo Codes
interface AdminPromoCode {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed' | 'free_shipping';
  value: number;
  min_order_amount: number | null;
  max_uses: number | null;
  current_uses: number;
  active: boolean;
  expires_at: string | null;
}

export async function fetchAdminPromoCodes(token: string): Promise<AdminPromoCode[]> {
  const res = await api.get<{ data: AdminPromoCode[] }>('/admin/promo_codes', { token });
  return res.data;
}

export async function createAdminPromoCode(
  data: Omit<AdminPromoCode, 'id' | 'current_uses'>,
  token: string
): Promise<AdminPromoCode> {
  const res = await api.post<{ data: AdminPromoCode }>('/admin/promo_codes', data, { token });
  return res.data;
}

export async function updateAdminPromoCode(
  id: string,
  data: Partial<AdminPromoCode>,
  token: string
): Promise<AdminPromoCode> {
  const res = await api.patch<{ data: AdminPromoCode }>(`/admin/promo_codes/${id}`, data, { token });
  return res.data;
}

export type { AdminBundle, AdminPromoCode };
