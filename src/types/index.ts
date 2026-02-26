export interface LocalizedString {
  hr: string;
  en: string;
}

export interface Bundle {
  id: string;
  slug: string;
  name: LocalizedString;
  description: LocalizedString;
  shortDescription: LocalizedString;
  items: BundleItem[];
  price: number;
  originalPrice?: number;
  badge: 'new' | 'popular' | 'sale' | null;
  category: string;
  emoji: string;
  colorFrom: string;
  colorTo: string;
  inStock: boolean;
}

export interface BundleItem {
  name: LocalizedString;
  description: LocalizedString;
  quantity: number;
}

export interface CartItem {
  bundleId: string;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  promoCode: string | null;
}

export interface PromoCode {
  code: string;
  type: 'percentage' | 'fixed' | 'free-shipping';
  value: number;
  minOrderAmount?: number;
  label: LocalizedString;
}

export interface ShippingMethod {
  id: string;
  name: LocalizedString;
  carrier: string;
  description: LocalizedString;
  price: number;
  estimatedDays: string;
  freeThreshold?: number;
}

export interface CheckoutFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  postalCode: string;
  city: string;
  company?: string;
  note?: string;
  shippingMethodId: string;
}
