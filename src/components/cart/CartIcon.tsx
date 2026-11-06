'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useCartStore } from '@/stores/cart-store';
import { loadBundles } from '@/services/cart-service';
import { useIsClient } from '@/components/cart/useCartData';

export default function CartIcon() {
  const t = useTranslations('cart');
  const locale = useLocale();
  const items = useCartStore((state) => state.items);
  // Gate on mount too: the persisted cart is read synchronously on the client, so
  // rendering the count during hydration would mismatch the server HTML.
  const storeHydrated = useCartStore((state) => state.isHydrated);
  const isClient = useIsClient();
  const isHydrated = storeHydrated && isClient;
  const lastAddedAt = useCartStore((state) => state.lastAdded?.at ?? null);
  const [bump, setBump] = useState(false);
  const seenAt = useRef(lastAddedAt);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // Bump the badge on every add (the scale is motion-safe only, see className).
  useEffect(() => {
    if (lastAddedAt === null || lastAddedAt === seenAt.current) return;
    seenAt.current = lastAddedAt;
    setBump(true);
    const timeout = setTimeout(() => setBump(false), 350);
    return () => clearTimeout(timeout);
  }, [lastAddedAt]);

  // Warm the bundle cache on intent so /cart renders prices immediately.
  const prefetch = () => {
    if (totalItems > 0) loadBundles(locale, { maxAge: 60_000 }).catch(() => {});
  };

  const label = isHydrated ? t('iconLabel', { count: totalItems }) : t('title');

  return (
    <Link
      href="/cart"
      className="relative group flex items-center justify-center min-w-[44px] min-h-[44px] rounded-full"
      aria-label={label}
      onMouseEnter={prefetch}
      onFocus={prefetch}
      onTouchStart={prefetch}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 text-text-mid group-hover:text-text-dark transition-colors duration-200"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>

      {isHydrated && totalItems > 0 && (
        <span
          aria-hidden="true"
          className={`
            absolute top-0 right-0 min-w-[20px] h-5 px-1
            flex items-center justify-center
            bg-[var(--color-teal-ink,#3F7C87)] text-white text-xs font-semibold tabular-nums
            rounded-full
            motion-safe:transition-transform motion-safe:duration-300
            ${bump ? 'motion-safe:scale-125 ring-2 ring-teal-light' : 'scale-100'}
          `}
        >
          {totalItems}
        </span>
      )}
    </Link>
  );
}
