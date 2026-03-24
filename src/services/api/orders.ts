import { api } from './client';
import type { Order, PaginatedResponse } from '@/types';

export interface CreateOrderParams {
  customer_email: string;
  customer_name: string;
  shipping_method_id: string;
  promo_code?: string;
  language: string;
  note?: string;
  save_address?: boolean;
  shipping_address: {
    first_name: string;
    last_name: string;
    street: string;
    city: string;
    postal_code: string;
    phone: string;
    company?: string;
  };
  items: Array<{ bundle_id: string; quantity: number }>;
}

export async function createOrder(
  params: CreateOrderParams,
  token?: string | null
): Promise<Order> {
  const res = await api.post<{ data: Order }>('/orders', params, { token });
  return res.data;
}

export async function fetchOrder(
  orderNumber: string,
  options: { email?: string; token?: string | null; locale?: string } = {}
): Promise<Order> {
  const { email, token, locale = 'hr' } = options;
  const queryParams = new URLSearchParams({ locale });
  if (email) queryParams.set('email', email);

  const res = await api.get<{ data: Order }>(
    `/orders/${orderNumber}?${queryParams}`,
    { token }
  );
  return res.data;
}

export async function fetchOrders(
  page: number = 1,
  token: string,
  locale: string = 'hr'
): Promise<PaginatedResponse<Order>> {
  return api.get<PaginatedResponse<Order>>(
    `/orders?page=${page}&locale=${locale}`,
    { token }
  );
}

export async function lookupOrder(
  orderNumber: string,
  email: string
): Promise<Order> {
  const res = await api.get<{ data: Order }>(
    `/orders/${orderNumber}/lookup?email=${encodeURIComponent(email)}`
  );
  return res.data;
}
