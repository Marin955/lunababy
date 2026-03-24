import type { Bundle, CartItem, PromoValidation, ShippingMethod } from '@/types';

export function calculateSubtotal(items: CartItem[], bundles: Bundle[]): number {
  return items.reduce((sum, item) => {
    const bundle = bundles.find((b) => b.id === item.bundleId);
    if (!bundle) return sum;
    return sum + bundle.price * item.quantity;
  }, 0);
}

export function calculateDiscount(
  subtotal: number,
  promo: PromoValidation | null
): number {
  if (!promo || !promo.valid) return 0;
  return promo.discount_amount ?? 0;
}

export function calculateShipping(
  subtotal: number,
  method: ShippingMethod,
  promo: PromoValidation | null
): number {
  if (promo?.valid && promo.discount_type === 'free_shipping') {
    return 0;
  }

  if (method.free_threshold !== null && subtotal >= method.free_threshold) {
    return 0;
  }

  return method.price;
}

export function calculateTotal(
  subtotal: number,
  discount: number,
  shipping: number
): number {
  return Math.max(0, subtotal - discount + shipping);
}
