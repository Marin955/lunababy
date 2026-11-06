'use client';

import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from '@/i18n/navigation';
import { useCartStore } from '@/stores/cart-store';
import { calculateSubtotal } from '@/services/cart-service';
import { formatPrice } from '@/lib/utils';
import Button from '@/components/ui/Button';
import BundleThumb from '@/components/cart/BundleThumb';
import FreeShippingProgress from '@/components/cart/FreeShippingProgress';
import { useCartBundles, useFreeShippingThreshold, useIsClient } from '@/components/cart/useCartData';

type LastAdded = NonNullable<ReturnType<typeof useCartStore.getState>['lastAdded']>;

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Add-to-cart confirmation: right-side drawer on desktop, bottom sheet on mobile.
 * Mounted once in the Header. It opens whenever `cartStore.lastAdded.at` changes,
 * so every `addItem()` caller triggers it without knowing about it.
 */
export default function MiniCart() {
  const t = useTranslations('miniCart');
  const tCommon = useTranslations('common.buttons');
  const locale = useLocale();
  const pathname = usePathname();
  const isClient = useIsClient();

  const lastAdded = useCartStore((s) => s.lastAdded);
  const items = useCartStore((s) => s.items);
  const isHydrated = useCartStore((s) => s.isHydrated);

  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState<LastAdded | null>(null);
  // Ignore an add that happened before this component mounted.
  const seenAt = useRef<number | null>(useCartStore.getState().lastAdded?.at ?? null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  // Prefetch once the cart has something in it, so the drawer and /cart render
  // prices without waiting on the API.
  const wantData = isClient && isHydrated && (items.length > 0 || shown !== null);
  const { bundles } = useCartBundles(locale, wantData);
  const threshold = useFreeShippingThreshold(locale, wantData);

  // Open on every new add.
  useEffect(() => {
    if (!lastAdded || lastAdded.at === seenAt.current) return;
    seenAt.current = lastAdded.at;
    const active = document.activeElement;
    if (active instanceof HTMLElement && !panelRef.current?.contains(active)) {
      triggerRef.current = active;
    }
    setShown(lastAdded);
    setOpen(true);
  }, [lastAdded]);

  const close = useCallback((restoreFocus = true) => {
    setOpen(false);
    const trigger = triggerRef.current;
    if (restoreFocus && trigger && document.contains(trigger)) {
      trigger.focus({ preventScroll: true });
    }
  }, []);

  // Close on route change (focus moves with the navigation instead).
  useEffect(() => {
    close(false);
  }, [pathname, close]);

  // Focus the close button when opening; lock page scroll while open.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      close();
      return;
    }
    if (e.key !== 'Tab' || !panelRef.current) return;
    const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const bundle = shown && bundles ? bundles.find((b) => b.id === shown.bundleId) : undefined;
  const subtotal = bundles ? calculateSubtotal(items, bundles) : null;
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  // Portal to <body>: the header uses backdrop-filter, which would make it the
  // containing block for this fixed-position drawer.
  if (!isClient) return null;

  return createPortal(
    <>
      {/* Screen-reader announcement, outside the dialog so it is read even if focus lags. */}
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {open && shown ? (bundle ? t('announce', { name: bundle.name, quantity: shown.quantity }) : t('title')) : ''}
      </p>

      <div
        className={`fixed inset-0 z-[70] ${open ? '' : 'pointer-events-none'}`}
        inert={!open}
        aria-hidden={!open}
      >
        {/* Overlay */}
        <div
          className={`absolute inset-0 bg-black/40 motion-safe:transition-opacity motion-safe:duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => close()}
          aria-hidden="true"
        />

        {/* Panel */}
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onKeyDown={onKeyDown}
          className={`
            absolute inset-x-0 bottom-0 flex max-h-[85dvh] flex-col rounded-t-[24px] bg-white shadow-xl
            sm:inset-x-auto sm:inset-y-0 sm:right-0 sm:max-h-none sm:w-[420px] sm:rounded-none
            motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out
            ${open ? 'translate-y-0 sm:translate-x-0' : 'translate-y-full sm:translate-x-full sm:translate-y-0'}
          `}
        >
          {/* Mobile grab handle (decorative) */}
          <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-gray-200 sm:hidden" aria-hidden="true" />

          {/* Header */}
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-3 sm:py-4">
            <h2 id={titleId} className="flex items-center gap-2 font-heading text-lg font-semibold text-text-dark">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-pale text-[var(--color-teal-ink,#3F7C87)]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              {t('title')}
            </h2>
            <button
              ref={closeRef}
              type="button"
              onClick={() => close()}
              className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-text-mid transition-colors hover:bg-gray-100 hover:text-text-dark"
              aria-label={tCommon('close')}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
            {/* Added item */}
            {shown && bundle ? (
              <div className="flex items-center gap-4">
                <BundleThumb bundle={bundle} size={72} />
                <div className="min-w-0 flex-1">
                  <p className="font-heading text-base font-semibold text-text-dark">{bundle.name}</p>
                  <p className="mt-0.5 text-sm text-text-mid">{t('quantity', { quantity: shown.quantity })}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold tabular-nums text-text-dark">
                    {formatPrice(bundle.price * shown.quantity, locale)}
                  </p>
                  {bundle.original_price && (
                    <p className="text-[13px] tabular-nums text-text-mid line-through">
                      {formatPrice(bundle.original_price * shown.quantity, locale)}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex animate-pulse items-center gap-4" aria-hidden="true">
                <div className="h-[72px] w-[72px] rounded-[--radius-md] bg-gray-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-2/3 rounded bg-gray-100" />
                  <div className="h-3 w-1/3 rounded bg-gray-100" />
                </div>
              </div>
            )}

            {/* Subtotal */}
            <div className="flex items-baseline justify-between border-t border-gray-100 pt-4">
              <span className="text-sm text-text-mid">{t('subtotal', { count: itemCount })}</span>
              {subtotal !== null ? (
                <span className="font-heading text-lg font-semibold tabular-nums text-text-dark">
                  {formatPrice(subtotal, locale)}
                </span>
              ) : (
                <span className="h-5 w-20 animate-pulse rounded bg-gray-100" aria-hidden="true" />
              )}
            </div>

            {subtotal !== null && (
              <FreeShippingProgress subtotal={subtotal} threshold={threshold} locale={locale} />
            )}
          </div>

          {/* Actions */}
          <div className="space-y-2 border-t border-gray-100 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
            <Button href="/checkout" variant="primary" size="lg" className="w-full">
              {t('checkout')}
            </Button>
            <Button href="/cart" variant="outline" size="lg" className="w-full">
              {t('viewCart')}
            </Button>
            <button
              type="button"
              onClick={() => close()}
              className="min-h-[44px] w-full cursor-pointer text-sm font-semibold text-text-mid transition-colors hover:text-text-dark"
            >
              {tCommon('continueShopping')}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
