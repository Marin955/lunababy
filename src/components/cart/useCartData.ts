'use client';

import { useEffect, useLayoutEffect, useState, useSyncExternalStore } from 'react';
import {
  getCachedBundles,
  getCachedShippingMethods,
  getFreeShippingThreshold,
  loadBundles,
  loadShippingMethods,
} from '@/services/cart-service';
import type { Bundle, ShippingMethod } from '@/types';

// Skip a network revalidation when the cache was refreshed this recently
// (e.g. the mini-cart just fetched, then the user clicked "View cart").
const REVALIDATE_AFTER_MS = 10_000;

const subscribeNoop = () => () => {};

/** False during SSR and the hydration render, true afterwards. */
export function useIsClient(): boolean {
  return useSyncExternalStore(subscribeNoop, () => true, () => false);
}

interface CachedState<T> {
  data: T | null;
  error: boolean;
}

function useCachedResource<T>(
  locale: string,
  enabled: boolean,
  get: (locale: string) => T | null,
  load: (locale: string, opts?: { maxAge?: number }) => Promise<T>
): CachedState<T> {
  const [state, setState] = useState<CachedState<T>>({ data: null, error: false });

  // Read the cache before paint so cached prices never flash a skeleton.
  useLayoutEffect(() => {
    if (!enabled) return;
    const cached = get(locale);
    if (cached) setState({ data: cached, error: false });
  }, [locale, enabled, get]);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    load(locale, { maxAge: REVALIDATE_AFTER_MS })
      .then((data) => {
        if (!cancelled) setState({ data, error: false });
      })
      .catch(() => {
        if (!cancelled) setState((prev) => ({ data: prev.data, error: prev.data === null }));
      });
    return () => {
      cancelled = true;
    };
  }, [locale, enabled, load]);

  return state;
}

/**
 * Bundle list for cart-like UIs: cached data right away (if any), then a background
 * revalidation. `bundles` is null until the first data arrives.
 */
export function useCartBundles(locale: string, enabled = true): { bundles: Bundle[] | null; error: boolean } {
  const { data, error } = useCachedResource(locale, enabled, getCachedBundles, loadBundles);
  return { bundles: data, error };
}

export function useShippingMethods(
  locale: string,
  enabled = true
): { methods: ShippingMethod[] | null; error: boolean } {
  const { data, error } = useCachedResource(locale, enabled, getCachedShippingMethods, loadShippingMethods);
  return { methods: data, error };
}

/** Lowest free-shipping threshold in cents; null while loading, on error, or if no method ships free. */
export function useFreeShippingThreshold(locale: string, enabled = true): number | null {
  const { methods } = useShippingMethods(locale, enabled);
  return methods ? getFreeShippingThreshold(methods) : null;
}
