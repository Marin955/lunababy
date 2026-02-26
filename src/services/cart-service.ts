import type { Bundle, CartItem, PromoCode, ShippingMethod } from '@/types';
import { promoCodes } from '@/data/promo-codes';

export function calculateSubtotal(items: CartItem[], bundles: Bundle[]): number {
  return items.reduce((sum, item) => {
    const bundle = bundles.find((b) => b.id === item.bundleId);
    if (!bundle) return sum;
    return sum + bundle.price * item.quantity;
  }, 0);
}

export function validatePromoCode(code: string): PromoCode | null {
  const normalized = code.trim().toUpperCase();
  return promoCodes.find((pc) => pc.code.toUpperCase() === normalized) ?? null;
}

export function calculateDiscount(
  subtotal: number,
  promoCode: PromoCode | null
): number {
  if (!promoCode) return 0;

  if (promoCode.minOrderAmount !== undefined && subtotal < promoCode.minOrderAmount) {
    return 0;
  }

  switch (promoCode.type) {
    case 'percentage': {
      const discount = (subtotal * promoCode.value) / 100;
      return Math.min(discount, subtotal);
    }
    case 'fixed': {
      return Math.min(promoCode.value, subtotal);
    }
    case 'free-shipping': {
      return 0;
    }
    default: {
      return 0;
    }
  }
}

export function calculateShipping(
  subtotal: number,
  method: ShippingMethod,
  promoCode: PromoCode | null
): number {
  if (promoCode?.type === 'free-shipping') {
    return 0;
  }

  if (method.freeThreshold !== undefined && subtotal >= method.freeThreshold) {
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
