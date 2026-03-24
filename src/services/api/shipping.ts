import { api } from './client';
import type { ShippingMethod } from '@/types';

export async function fetchShippingMethods(locale: string = 'hr'): Promise<ShippingMethod[]> {
  const res = await api.get<{ data: ShippingMethod[] }>(`/shipping_methods?locale=${locale}`);
  return res.data;
}
