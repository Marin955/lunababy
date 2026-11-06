'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { useCartStore } from '@/stores/cart-store';
import { useAuthStore } from '@/stores/auth-store';
import { createOrder } from '@/services/api/orders';
import type { CreateOrderParams } from '@/services/api/orders';
import { TERMS_HREF, WITHDRAWAL_HREF } from '@/lib/constants';
import Button from '@/components/ui/Button';
import CheckoutField from './CheckoutField';
import ShippingSelector from './ShippingSelector';
import PickupPointSelector, { EMPTY_PICKUP_DRAFT, pickupPointFromDraft } from './pickup/PickupPointSelector';
import type { PickupDraft } from './pickup/PickupPointSelector';
import type { CartItem, OrderPickupPoint, ShippingMethod } from '@/types';

export interface CheckoutFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  postalCode: string;
  city: string;
  company: string;
  note: string;
}

type ErrorKey = keyof CheckoutFormValues | 'shippingMethod' | 'pickupPoint' | 'terms';
type Errors = Partial<Record<ErrorKey, string>>;

// Validation order = DOM order, so the first error found is the first one on the page.
const FIELD_ORDER: ErrorKey[] = [
  'firstName',
  'lastName',
  'email',
  'phone',
  'shippingMethod',
  'pickupPoint',
  'street',
  'postalCode',
  'city',
  'terms',
];

const fieldId = (key: ErrorKey) => `checkout-${key}`;
const SHIPPING_ID_PREFIX = 'checkout-shippingMethod';

interface CheckoutFormProps {
  locale: string;
  items: CartItem[];
  shippingMethods: ShippingMethod[];
  selectedShippingMethodId: string | null;
  onSelectShippingMethod: (id: string) => void;
  /** Subtotal after bundle discounts, before promo. */
  subtotal: number;
  freeShippingPromo: boolean;
  promoCode: string | null;
  onOrderPlaced?: () => void;
}

// Kept for the browser tab only, so a customer who goes back from the Stripe
// payment page does not have to type everything again. Terms acceptance is
// deliberately not restored.
const DRAFT_KEY = 'lb_checkout_draft';

interface Draft {
  values?: Partial<CheckoutFormValues>;
  pickupPoint?: OrderPickupPoint | null;
  shippingMethodId?: string | null;
}

function loadDraft(): Draft {
  try {
    const raw = JSON.parse(sessionStorage.getItem(DRAFT_KEY) || '{}');
    // Drafts saved before pickup points existed were the bare values object.
    return raw && 'values' in raw ? raw : { values: raw };
  } catch {
    return {};
  }
}

function saveDraft(draft: Draft | null) {
  try {
    if (draft) sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    else sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    // storage unavailable (private mode): nothing to restore later
  }
}

const initialValues: CheckoutFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  street: '',
  postalCode: '',
  city: '',
  company: '',
  note: '',
};

export default function CheckoutForm({
  locale,
  items,
  shippingMethods,
  selectedShippingMethodId,
  onSelectShippingMethod,
  subtotal,
  freeShippingPromo,
  promoCode,
  onOrderPlaced,
}: CheckoutFormProps) {
  const t = useTranslations('checkout');
  const router = useRouter();
  const clearCart = useCartStore((state) => state.clearCart);
  const token = useAuthStore((state) => state.token);

  const [values, setValues] = useState<CheckoutFormValues>(initialValues);
  const [pickupPoint, setPickupPoint] = useState<OrderPickupPoint | null>(null);
  const [pickupDraft, setPickupDraft] = useState<PickupDraft>(EMPTY_PICKUP_DRAFT);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const selectedMethod = shippingMethods.find((m) => m.id === selectedShippingMethodId) ?? null;
  const needsPickupPoint = Boolean(selectedMethod?.requires_pickup_point);

  useEffect(() => {
    const draft = loadDraft();
    if (draft.values && Object.keys(draft.values).length > 0) {
      setValues((prev) => ({ ...prev, ...draft.values }));
    }
    if (draft.pickupPoint) setPickupPoint(draft.pickupPoint);
    if (draft.shippingMethodId && shippingMethods.some((m) => m.id === draft.shippingMethodId)) {
      onSelectShippingMethod(draft.shippingMethodId);
    }
    // Restore once, when the form first renders with the loaded methods.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function clearError(key: ErrorKey) {
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function handleChange(field: keyof CheckoutFormValues, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
    clearError(field);
  }

  const handlePickupChange = useCallback((point: OrderPickupPoint | null) => {
    setPickupPoint(point);
    if (point) clearError('pickupPoint');
  }, []);

  function validate(effectivePickupPoint: OrderPickupPoint | null): Errors {
    const newErrors: Errors = {};
    const required: (keyof CheckoutFormValues)[] = [
      'firstName',
      'lastName',
      'email',
      'phone',
      'street',
      'postalCode',
      'city',
    ];
    for (const field of required) {
      if (!values[field].trim()) newErrors[field] = t('errors.required');
    }
    if (values.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      newErrors.email = t('errors.invalidEmail');
    }
    if (values.phone.trim() && values.phone.replace(/\D/g, '').length < 8) {
      newErrors.phone = t('errors.invalidPhone');
    }
    if (values.postalCode.trim() && !/^\d{5}$/.test(values.postalCode.trim())) {
      newErrors.postalCode = t('errors.invalidPostalCode');
    }
    if (!selectedMethod) newErrors.shippingMethod = t('errors.shippingMethod');
    if (needsPickupPoint && !effectivePickupPoint) newErrors.pickupPoint = t('errors.pickupPoint');
    if (!termsAccepted) newErrors.terms = t('errors.terms');
    return newErrors;
  }

  function focusFirstError(found: Errors) {
    const first = FIELD_ORDER.find((key) => found[key]);
    if (!first) return;
    const id = first === 'shippingMethod' ? `${SHIPPING_ID_PREFIX}-0` : fieldId(first);
    const el = document.getElementById(id);
    if (!el) return;
    el.focus({ preventScroll: true });
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // A typed but unconfirmed locker counts as chosen.
    const effectivePickupPoint = needsPickupPoint ? pickupPoint ?? pickupPointFromDraft(pickupDraft) : null;
    if (needsPickupPoint && !pickupPoint && effectivePickupPoint) setPickupPoint(effectivePickupPoint);

    const found = validate(effectivePickupPoint);
    setErrors(found);
    if (Object.keys(found).length > 0 || !selectedMethod) {
      focusFirstError(found);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    const orderParams: CreateOrderParams = {
      customer_email: values.email.trim(),
      customer_name: `${values.firstName.trim()} ${values.lastName.trim()}`,
      shipping_method_id: selectedMethod.id,
      language: locale,
      note: values.note.trim() || undefined,
      promo_code: promoCode || undefined,
      terms_accepted: true,
      pickup_point: effectivePickupPoint ?? undefined,
      shipping_address: {
        first_name: values.firstName.trim(),
        last_name: values.lastName.trim(),
        street: values.street.trim(),
        city: values.city.trim(),
        postal_code: values.postalCode.trim(),
        phone: values.phone.trim(),
        company: values.company.trim() || undefined,
      },
      items: items.map((item) => ({ bundle_id: item.bundleId, quantity: item.quantity })),
    };

    try {
      const { order, checkoutUrl } = await createOrder(orderParams, token);
      onOrderPlaced?.();
      if (checkoutUrl) {
        saveDraft({ values, pickupPoint: effectivePickupPoint, shippingMethodId: selectedMethod.id });
        // The cart is cleared on the confirmation page once Stripe reports the payment.
        window.location.assign(checkoutUrl);
        return; // keep the button disabled while the browser leaves
      }
      saveDraft(null);
      clearCart();
      router.push(`/order-confirmation?order=${order.order_number}&email=${encodeURIComponent(values.email.trim())}`);
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      const message =
        status === 502 ? t('errors.paymentFailed') : err instanceof Error ? err.message : t('errors.orderFailed');
      setSubmitError(message);
    }
    setSubmitting(false);
  }

  const field = (key: keyof CheckoutFormValues) => ({
    id: fieldId(key),
    value: values[key],
    error: errors[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleChange(key, e.target.value),
  });

  const validPostalCode = /^\d{5}$/.test(values.postalCode.trim()) ? values.postalCode.trim() : undefined;
  const errorCount = Object.keys(errors).length;

  return (
    <form onSubmit={handleSubmit} noValidate aria-describedby={errorCount > 0 ? 'checkout-error-summary' : undefined}>
      <div className="space-y-6">
        {/* 1. Contact */}
        <Section step={1} title={t('steps.contact')}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <CheckoutField label={t('form.firstName')} autoComplete="given-name" required {...field('firstName')} />
            <CheckoutField label={t('form.lastName')} autoComplete="family-name" required {...field('lastName')} />
            <CheckoutField
              label={t('form.email')}
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              {...field('email')}
            />
            <CheckoutField
              label={t('form.phone')}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder={t('form.phonePlaceholder')}
              required
              {...field('phone')}
            />
          </div>
        </Section>

        {/* 2. Delivery method */}
        <Section step={2} title={t('shipping.title')} as="fieldset">
          <ShippingSelector
            methods={shippingMethods}
            selectedMethodId={selectedShippingMethodId}
            onSelect={(id) => {
              onSelectShippingMethod(id);
              clearError('shippingMethod');
            }}
            locale={locale}
            subtotal={subtotal}
            freeShippingPromo={freeShippingPromo}
            idPrefix={SHIPPING_ID_PREFIX}
          />
          {errors.shippingMethod && <p className="mt-2 text-sm text-red-600">{errors.shippingMethod}</p>}
        </Section>

        {/* 3. Pickup point and/or address */}
        <Section step={3} title={needsPickupPoint ? t('steps.pickup') : t('steps.address')}>
          {needsPickupPoint && (
            <div className="mb-6">
              <PickupPointSelector
                value={pickupPoint}
                onChange={handlePickupChange}
                draft={pickupDraft}
                onDraftChange={(draft) => {
                  setPickupDraft(draft);
                  if (draft.text.trim()) clearError('pickupPoint');
                }}
                error={errors.pickupPoint}
                zip={validPostalCode}
                focusId={fieldId('pickupPoint')}
              />
              <h3 className="mt-6 text-base font-semibold text-text-dark">{t('steps.billingAddress')}</h3>
              <p className="mt-1 text-sm text-text-mid">{t('pickup.billingHint')}</p>
            </div>
          )}
          <div className="space-y-4">
            <CheckoutField
              label={t('form.street')}
              autoComplete="street-address"
              placeholder={t('form.streetPlaceholder')}
              required
              {...field('street')}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
              <CheckoutField
                label={t('form.postalCode')}
                inputMode="numeric"
                autoComplete="postal-code"
                maxLength={5}
                placeholder={t('form.postalCodePlaceholder')}
                required
                {...field('postalCode')}
              />
              <CheckoutField label={t('form.city')} autoComplete="address-level2" required {...field('city')} />
            </div>
            <CheckoutField label={t('form.company')} autoComplete="organization" {...field('company')} />
          </div>
        </Section>

        {/* 4. Note */}
        <Section step={4} title={t('steps.note')}>
          <CheckoutField
            label={t('form.note')}
            multiline
            placeholder={t('form.notePlaceholder')}
            maxLength={1000}
            {...field('note')}
          />
        </Section>

        {/* 5. Terms + 6. Submit */}
        <div className="rounded-[--radius-lg] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <input
              id={fieldId('terms')}
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => {
                setTermsAccepted(e.target.checked);
                if (e.target.checked) clearError('terms');
              }}
              aria-invalid={errors.terms ? true : undefined}
              aria-describedby={errors.terms ? `${fieldId('terms')}-error` : undefined}
              className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-teal-deep"
            />
            <label htmlFor={fieldId('terms')} className="cursor-pointer text-sm leading-relaxed text-text-dark">
              {t.rich('terms.label', {
                terms: (chunks) => <TermsLink href={TERMS_HREF}>{chunks}</TermsLink>,
                withdrawal: (chunks) => <TermsLink href={WITHDRAWAL_HREF}>{chunks}</TermsLink>,
              })}
            </label>
          </div>
          {errors.terms && (
            <p id={`${fieldId('terms')}-error`} className="mt-2 pl-8 text-sm text-red-600">
              {errors.terms}
            </p>
          )}

          {errorCount > 0 && (
            <p id="checkout-error-summary" role="alert" className="mt-5 text-sm font-medium text-red-600">
              {t('errors.summary', { count: errorCount })}
            </p>
          )}
          {submitError && (
            <div role="alert" className="mt-5 rounded-[--radius-sm] border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {submitError}
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={submitting}
            className="mt-5 min-h-12 w-full disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {submitting ? t('redirecting') : t('submit')}
          </Button>
          <p className="mt-3 flex items-start justify-center gap-1.5 text-center text-[13px] leading-snug text-text-mid">
            <svg aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x="4" y="11" width="16" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
            {t('securePayment')}
          </p>
        </div>
      </div>
    </form>
  );
}

function Section({
  step,
  title,
  as = 'section',
  children,
}: {
  step: number;
  title: string;
  as?: 'section' | 'fieldset';
  children: React.ReactNode;
}) {
  const heading = (
    <span className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-pale text-sm font-bold text-text-dark"
      >
        {step}
      </span>
      <span className="font-heading text-xl font-semibold text-text-dark">{title}</span>
    </span>
  );

  if (as === 'fieldset') {
    return (
      <fieldset className="min-w-0 rounded-[--radius-lg] bg-white p-5 shadow-sm sm:p-6">
        <legend className="float-left mb-4 w-full">{heading}</legend>
        <div className="clear-both">{children}</div>
      </fieldset>
    );
  }

  return (
    <section className="rounded-[--radius-lg] bg-white p-5 shadow-sm sm:p-6">
      <h2 className="mb-4">{heading}</h2>
      {children}
    </section>
  );
}

function TermsLink({ href, children }: { href: string; children: React.ReactNode }) {
  const t = useTranslations('checkout');
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener"
      className="font-semibold text-text-dark underline underline-offset-2 hover:text-teal-deep"
      onClick={(e) => e.stopPropagation()}
    >
      {children}
      <span className="sr-only"> {t('opensInNewTab')}</span>
    </Link>
  );
}
