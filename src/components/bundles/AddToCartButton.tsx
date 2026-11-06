'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useCartStore } from '@/stores/cart-store';
import Button from '@/components/ui/Button';
import QuantitySelector from '@/components/bundles/QuantitySelector';

interface AddToCartButtonProps {
  bundleId: string;
  inStock: boolean;
  /**
   * When set, a quantity selector (1..min(10, maxQuantity)) renders above the button.
   * Bundle cards leave it out and add one unit.
   */
  maxQuantity?: number;
}

export default function AddToCartButton({ bundleId, inStock, maxQuantity }: AddToCartButtonProps) {
  const t = useTranslations('bundle');
  const addItem = useCartStore((state) => state.addItem);
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const withQuantity = maxQuantity !== undefined;

  useEffect(() => () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
  }, []);

  const handleAdd = useCallback(() => {
    addItem(bundleId, withQuantity ? quantity : 1);
    setAdded(true);
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setAdded(false), 2000);
  }, [addItem, bundleId, quantity, withQuantity]);

  const button = (
    <Button
      variant="primary"
      size="lg"
      onClick={handleAdd}
      disabled={!inStock}
      className={`w-full ${added ? 'bg-teal-ink-hover' : ''}`}
    >
      {!inStock ? (
        t('outOfStock')
      ) : added ? (
        <span className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          {t('addedToCart')}
        </span>
      ) : (
        t('addToCart')
      )}
    </Button>
  );

  if (!withQuantity) return button;

  return (
    <div className="flex flex-col gap-4">
      {inStock && (
        <QuantitySelector
          id={`quantity-${bundleId}`}
          value={quantity}
          max={maxQuantity}
          onChange={setQuantity}
        />
      )}
      {button}
      <span className="sr-only" aria-live="polite">
        {added ? t('addedToCart') : ''}
      </span>
    </div>
  );
}
