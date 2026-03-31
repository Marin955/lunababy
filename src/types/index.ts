// API response types — all monetary values are integer cents

export type Locale = 'hr' | 'en';

// Bundle list item (from GET /api/v1/bundles)
export interface Bundle {
  id: string;
  slug: string;
  name: string;
  short_description: string;
  price: number; // cents
  original_price: number | null;
  discount_percent: number;
  badge: 'new' | 'popular' | 'sale' | null;
  category: string;
  emoji: string;
  color_from: string;
  color_to: string;
  image_path: string | null;
  in_stock: boolean;
}

// Bundle detail (from GET /api/v1/bundles/:slug)
export interface BundleDetail extends Bundle {
  description: string;
  stock_quantity: number;
  items: BundleItem[];
}

export interface BundleItem {
  id: string;
  product_id: string;
  name: string;
  description: string;
  quantity: number;
  image_path: string | null;
}

// Cart (client-side)
export interface CartItem {
  bundleId: string;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  promoCode: string | null;
}

// Promo code validation response
export interface PromoValidation {
  code: string;
  valid: boolean;
  discount_type?: 'percentage' | 'fixed' | 'free_shipping';
  value?: number;
  discount_amount?: number;
  label?: string;
  reason?: string;
}

// Shipping method (from GET /api/v1/shipping_methods)
export interface ShippingMethod {
  id: string;
  slug: string;
  name: string;
  carrier: string;
  description: string;
  price: number; // cents
  estimated_days: string;
  free_threshold: number | null;
}

// Order
export interface Order {
  id: string;
  order_number: string;
  status: OrderStatus;
  customer_email: string;
  customer_name: string;
  subtotal: number; // cents
  discount_amount: number; // cents
  shipping_cost: number; // cents
  total: number; // cents
  language: string;
  note: string | null;
  created_at: string;
  shipping_address: ShippingAddress;
  items: OrderItem[];
  shipping_method: { slug: string; name: string; price: number };
  promo_code: { code: string; discount_type: string; value: number } | null;
  shipment: Shipment | null;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface ShippingAddress {
  first_name: string;
  last_name: string;
  street: string;
  city: string;
  postal_code: string;
  phone: string;
  company: string | null;
}

export interface OrderItem {
  bundle_slug: string;
  bundle_name: string;
  quantity: number;
  unit_price: number; // cents
  line_total: number; // cents
}

export interface Shipment {
  carrier: string;
  tracking_number: string;
  shipped_at: string;
  estimated_delivery_at: string;
  tracking_url: string | null;
}

// User / Auth
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  language: string;
  role: 'customer' | 'admin';
  addresses: Address[];
}

export interface Address {
  id: string;
  first_name: string;
  last_name: string;
  street: string;
  city: string;
  postal_code: string;
  phone: string;
  company: string | null;
  is_default: boolean;
}

export interface AuthData {
  token: string;
  refresh_token: string;
  user: User;
}

export interface AuthResponse {
  data: AuthData;
}

// Pagination
export interface PaginationMeta {
  current_page: number;
  total_pages: number;
  total_count: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// Checkout form
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

// Admin
export interface AdminDashboard {
  total_orders: number;
  orders_by_status: Record<string, number>;
  revenue_total: number;
  recent_orders: AdminRecentOrder[];
  low_stock_products: AdminLowStockProduct[];
}

export interface AdminRecentOrder {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  total: number;
  status: string;
  created_at: string;
}

export interface AdminLowStockProduct {
  id: string;
  name_hr: string;
  name_en: string;
  stock_quantity: number;
  low_stock_threshold: number;
  bundles: string[];
}

// Admin product
export interface AdminProduct {
  id: string;
  sku: string | null;
  name_hr: string;
  name_en: string;
  description_hr: string | null;
  description_en: string | null;
  sex: 'unisex' | 'female' | 'male';
  purchase_price: number; // cents
  purchase_price_with_vat: number; // cents
  msrp: number; // cents
  supplier_name: string | null;
  supplier_url: string | null;
  image_path: string | null;
  stock_quantity: number;
  low_stock_threshold: number;
  active: boolean;
  position: number;
  bundles: { id: string; name_hr: string; name_en: string; slug: string }[];
}
