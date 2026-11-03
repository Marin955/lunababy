'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { fetchOrder, confirmPayment } from '@/services/api/orders';
import { useCartStore } from '@/stores/cart-store';
import { formatPrice } from '@/lib/utils';
import type { Order } from '@/types';
import { COLLECTION_HREF } from '@/lib/constants';

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-20 w-20 bg-gray-100 rounded-full mx-auto" />
          <div className="h-8 bg-gray-100 rounded w-64 mx-auto" />
        </div>
      </div>
    }>
      <OrderConfirmationContent />
    </Suspense>
  );
}

function OrderConfirmationContent() {
  const t = useTranslations('confirmation');
  const locale = useLocale();
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');
  const email = searchParams.get('email');
  const sessionId = searchParams.get('session_id');
  const clearCart = useCartStore((state) => state.clearCart);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(!!orderNumber);

  // Back from Stripe: ask the API to confirm the payment. Card payments are
  // usually confirmed immediately; otherwise poll for a while.
  useEffect(() => {
    if (!orderNumber) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;

    const load = async () => {
      try {
        const result = sessionId
          ? await confirmPayment(orderNumber, sessionId, locale)
          : await fetchOrder(orderNumber, { locale, email: email || undefined });
        if (cancelled) return;
        setOrder(result);
        if (result.payment_status === 'paid') {
          clearCart();
          try { sessionStorage.removeItem('lb_checkout_draft'); } catch {}
        }
        if (sessionId && result.payment_status === 'unpaid' && attempts++ < 20) {
          timer = setTimeout(load, 3000);
        }
      } catch {
        // fall through to the generic view
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [orderNumber, sessionId, email, locale, clearCart]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-20 w-20 bg-gray-100 rounded-full mx-auto" />
          <div className="h-8 bg-gray-100 rounded w-64 mx-auto" />
          <div className="h-4 bg-gray-100 rounded w-96 mx-auto" />
        </div>
      </div>
    );
  }

  if (order && order.payment_status !== 'paid') {
    const pending = order.payment_status === 'unpaid';
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-8 ${pending ? 'bg-teal-pale' : 'bg-amber-50'}`}>
          {pending ? (
            <div className="h-9 w-9 rounded-full border-[3px] border-teal-deep border-t-transparent animate-spin" aria-hidden="true" />
          ) : (
            <span className="text-3xl font-bold text-amber-700" aria-hidden="true">!</span>
          )}
        </div>
        <h1 className="font-heading text-3xl lg:text-4xl font-semibold text-text-dark mb-4">
          {pending ? t('pendingTitle') : t('notPaidTitle')}
        </h1>
        <p className="text-text-mid mb-8 max-w-lg mx-auto leading-relaxed" role="status">
          {pending ? t('pendingMessage') : t('notPaidMessage')}
        </p>
        <div className="inline-block bg-gray-50 rounded-[--radius-md] px-6 py-4 mb-8">
          <p className="text-sm text-text-light mb-1">{t('orderNumber')}</p>
          <p className="font-heading text-2xl font-bold text-text-dark">{order.order_number}</p>
        </div>
        {!pending && (
          <div>
            <Link
              href="/cart"
              className="inline-flex items-center justify-center px-8 py-4 bg-teal-deep text-white font-semibold rounded-[--radius-md] hover:bg-teal shadow-md transition-all duration-300"
            >
              {t('backToCart')}
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-16 text-center">
      {/* Checkmark icon */}
      <div className="mx-auto w-20 h-20 bg-teal-pale rounded-full flex items-center justify-center mb-8">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10 text-teal-deep"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      {/* Title */}
      <h1 className="font-heading text-3xl lg:text-4xl font-semibold text-text-dark mb-4">
        {t('title')}
      </h1>

      {/* Message */}
      <p className="text-text-mid mb-8 max-w-lg mx-auto leading-relaxed">
        {t('message')}
      </p>

      {/* Order number */}
      <div className="inline-block bg-gray-50 rounded-[--radius-md] px-6 py-4 mb-8">
        <p className="text-sm text-text-light mb-1">{t('orderNumber')}</p>
        <p className="font-heading text-2xl font-bold text-text-dark">
          {order?.order_number || orderNumber || '---'}
        </p>
      </div>

      {/* Order details if loaded */}
      {order && (
        <div className="bg-gray-50 rounded-[--radius-md] px-6 py-4 mb-8 text-left max-w-md mx-auto space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-text-mid">{t('orderTotal')}</span>
            <span className="font-semibold text-text-dark">{formatPrice(order.total, locale)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-mid">{t('email')}</span>
            <span className="text-text-dark">{order.customer_email}</span>
          </div>
        </div>
      )}

      {/* Continue shopping button */}
      <Link
        href={COLLECTION_HREF}
        className="inline-flex items-center justify-center px-8 py-4 bg-teal-deep text-white font-semibold rounded-[--radius-md] hover:bg-teal shadow-md hover:shadow-hover hover:-translate-y-0.5 transition-all duration-300"
      >
        {t('continueShopping')}
      </Link>
    </div>
  );
}
