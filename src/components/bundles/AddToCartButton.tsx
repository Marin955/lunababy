'use client';

import React, { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useCartStore } from '@/stores/cart-store';
import Button from '@/components/ui/Button';

interface AddToCartButtonProps {
  bundleId: string;
}

export default function AddToCartButton({ bundleId }: AddToCartButtonProps) {
  const t = useTranslations('bundle');
  const addItem = useCartStore((state) => state.addItem);
  const [added, setAdded] = useState(false);

  const handleAdd = useCallback(() => {
    addItem(bundleId);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }, [addItem, bundleId]);

  return (
    <Button
      variant="primary"
      size="lg"
      onClick={handleAdd}
      className={`w-full ${added ? 'bg-teal' : ''}`}
    >
      {added ? (
        <span className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
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
}
