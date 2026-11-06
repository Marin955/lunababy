import { api } from './client';
import type { Order, OrderPickupPoint, PaginatedResponse } from '@/types';

export interface CreateOrderParams {
  customer_email: string;
  customer_name: string;
  shipping_method_id: string;
  promo_code?: string;
  language: string;
  note?: string;
  save_address?: boolean;
  /** Must be true: the customer ticked the terms-of-sale checkbox. */
  terms_accepted: boolean;
  /** Required when the shipping method has requires_pickup_point. */
  pickup_point?: OrderPickupPoint;
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

export interface CreatedOrder {
  order: Order;
  /** Stripe Checkout page to send the customer to; null when nothing is owed. */
  checkoutUrl: string | null;
}

export async function createOrder(
  params: CreateOrderParams,
  token?: string | null
): Promise<CreatedOrder> {
  const res = await api.post<{ data: Order; checkout_url: string | null }>('/orders', params, { token });
  return { order: res.data, checkoutUrl: res.checkout_url };
}

/** Called on return from Stripe; the session id proves the customer paid for this order. */
export async function confirmPayment(
  orderNumber: string,
  sessionId: string,
  locale: string = 'hr'
): Promise<Order> {
  const res = await api.post<{ data: Order }>(
    `/orders/${orderNumber}/confirm_payment?locale=${locale}`,
    { session_id: sessionId }
  );
  return res.data;
}

/** The customer came back from Stripe without paying: release the reserved stock. */
export async function abandonOrder(orderId: string): Promise<void> {
  await api.post('/orders/abandon', { order_id: orderId });
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
