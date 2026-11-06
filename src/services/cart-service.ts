import type { Bundle, CartItem, PromoValidation, ShippingMethod } from '@/types';
import { fetchBundles } from '@/services/api/bundles';
import { fetchShippingMethods } from '@/services/api/shipping';

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

/** Savings from bundle discounts: sum((original_price - price) × quantity). */
export function calculateBundleSavings(items: CartItem[], bundles: Bundle[]): number {
  return items.reduce((sum, item) => {
    const bundle = bundles.find((b) => b.id === item.bundleId);
    if (!bundle?.original_price) return sum;
    return sum + (bundle.original_price - bundle.price) * item.quantity;
  }, 0);
}

/**
 * Lowest non-null `free_threshold` across shipping methods, in cents, or null
 * when no method ships free. Compare it with `calculateSubtotal()` (after bundle
 * discounts, before promo codes), the same amount `calculateShipping()` uses.
 */
export function getFreeShippingThreshold(methods: ShippingMethod[]): number | null {
  const thresholds = methods
    .map((m) => m.free_threshold)
    .filter((t): t is number => t !== null);
  return thresholds.length > 0 ? Math.min(...thresholds) : null;
}

// ---------------------------------------------------------------------------
// Cached catalogue fetches (stale-while-revalidate).
//
// The cart store keeps only bundleId + quantity, so the cart, mini-cart and
// checkout need the bundle list to show names and prices. These helpers keep
// the last response per locale in memory and in sessionStorage, so a page can
// render prices right after hydration and revalidate in the background.
//
//   const cached = getCachedBundles(locale);      // sync; null if none / expired
//   const fresh = await loadBundles(locale);      // network (deduped), updates cache
//
// Prices shown from the cache are display-only: the backend recomputes every
// amount when the order is created.
// ---------------------------------------------------------------------------

interface CacheEntry<T> {
  at: number;
  data: T;
}

interface CachedResource<T> {
  /** Cached value younger than the TTL, or null. Safe to call during render on the client. */
  get: (locale: string) => T | null;
  /**
   * Fetch from the API, unless the cache is younger than `maxAge` ms (default 0 = always fetch).
   * Concurrent calls for the same locale share one request.
   */
  load: (locale: string, opts?: { maxAge?: number }) => Promise<T>;
}

function createCachedResource<T>(
  name: string,
  ttlMs: number,
  fetcher: (locale: string) => Promise<T>
): CachedResource<T> {
  const memory = new Map<string, CacheEntry<T>>();
  const inFlight = new Map<string, Promise<T>>();
  const storageKey = (locale: string) => `lunababy-cache:${name}:${locale}`;

  // Client-only: on the server this module is shared across requests, so it never caches there.
  function read(locale: string): CacheEntry<T> | null {
    if (typeof window === 'undefined') return null;
    const mem = memory.get(locale);
    if (mem) return mem;
    try {
      const raw = window.sessionStorage.getItem(storageKey(locale));
      if (!raw) return null;
      const entry = JSON.parse(raw) as CacheEntry<T>;
      if (typeof entry?.at !== 'number') return null;
      memory.set(locale, entry);
      return entry;
    } catch {
      return null;
    }
  }

  function write(locale: string, data: T) {
    if (typeof window === 'undefined') return;
    const entry = { at: Date.now(), data };
    memory.set(locale, entry);
    try {
      window.sessionStorage.setItem(storageKey(locale), JSON.stringify(entry));
    } catch {
      // Storage full or blocked (private mode): the memory cache still works.
    }
  }

  function get(locale: string): T | null {
    const entry = read(locale);
    if (!entry || Date.now() - entry.at > ttlMs) return null;
    return entry.data;
  }

  function load(locale: string, opts: { maxAge?: number } = {}): Promise<T> {
    const maxAge = opts.maxAge ?? 0;
    if (maxAge > 0) {
      const entry = read(locale);
      if (entry && Date.now() - entry.at <= Math.min(maxAge, ttlMs)) {
        return Promise.resolve(entry.data);
      }
    }
    const pending = inFlight.get(locale);
    if (pending) return pending;
    const promise = fetcher(locale)
      .then((data) => {
        write(locale, data);
        return data;
      })
      .finally(() => inFlight.delete(locale));
    inFlight.set(locale, promise);
    return promise;
  }

  return { get, load };
}

const bundlesResource = createCachedResource<Bundle[]>('bundles', 5 * 60 * 1000, fetchBundles);
const shippingResource = createCachedResource<ShippingMethod[]>(
  'shipping-methods',
  30 * 60 * 1000,
  fetchShippingMethods
);

/** Last bundle list for this locale if fetched within 5 minutes, else null. */
export const getCachedBundles = bundlesResource.get;
/** Fetch the bundle list (deduped) and refresh the cache. */
export const loadBundles = bundlesResource.load;
/** Last shipping-method list for this locale if fetched within 30 minutes, else null. */
export const getCachedShippingMethods = shippingResource.get;
/** Fetch shipping methods (deduped) and refresh the cache. */
export const loadShippingMethods = shippingResource.load;
