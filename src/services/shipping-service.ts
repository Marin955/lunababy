import type { ShippingMethod } from '@/types';
import { fetchShippingMethods } from './api/shipping';

export async function getShippingMethods(locale: string = 'hr'): Promise<ShippingMethod[]> {
  const methods = await fetchShippingMethods(locale);
  return methods.sort((a, b) => a.price - b.price);
}
