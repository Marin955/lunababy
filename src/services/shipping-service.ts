import type { ShippingMethod } from '@/types';
import { shippingMethods } from '@/data/shipping-methods';

export function getShippingMethods(): ShippingMethod[] {
  return [...shippingMethods].sort((a, b) => a.price - b.price);
}
