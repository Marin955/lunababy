'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { useCartStore } from '@/stores/cart-store';

export default function CartIcon() {
  const items = useCartStore((state) => state.items);
  const isHydrated = useCartStore((state) => state.isHydrated);
  const [animate, setAnimate] = useState(false);
  const prevCount = useRef(0);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    if (isHydrated && totalItems !== prevCount.current && prevCount.current !== 0) {
      setAnimate(true);
      const timeout = setTimeout(() => setAnimate(false), 300);
      return () => clearTimeout(timeout);
    }
    prevCount.current = totalItems;
  }, [totalItems, isHydrated]);

  return (
    <Link href="/cart" className="relative group flex items-center justify-center min-w-[44px] min-h-[44px]" aria-label="Cart">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 text-text-mid group-hover:text-teal-deep transition-colors duration-200"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>

      {isHydrated && totalItems > 0 && (
        <span
          className={`
            absolute -top-2 -right-2 min-w-[20px] h-5 px-1
            flex items-center justify-center
            bg-teal-deep text-white text-xs font-semibold
            rounded-full
            transition-transform duration-300
            ${animate ? 'scale-125' : 'scale-100'}
          `}
        >
          {totalItems}
        </span>
      )}
    </Link>
  );
}
