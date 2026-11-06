'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import BoxNowWidget from './BoxNowWidget';
import { PICKUP_PROVIDERS, getPickupProvider, providerLabel } from './providers';
import type { PickupPoint, PickupProviderId } from './providers';

/** What the customer has typed but not confirmed yet (manual fallback). */
export interface PickupDraft {
  provider: PickupProviderId;
  text: string;
}

export const EMPTY_PICKUP_DRAFT: PickupDraft = { provider: 'boxnow', text: '' };

/** Turns a typed locker name/code into a pickup point; null when empty. */
export function pickupPointFromDraft(draft: PickupDraft): PickupPoint | null {
  const text = draft.text.trim();
  return text ? { provider: draft.provider, id: text, name: text, address: null } : null;
}

interface PickupPointSelectorProps {
  value: PickupPoint | null;
  onChange: (point: PickupPoint | null) => void;
  draft: PickupDraft;
  onDraftChange: (draft: PickupDraft) => void;
  error?: string;
  /** Postal code from the form (5 digits), used to centre provider maps. */
  zip?: string;
  /** DOM id of the first control, so a failed submit can focus it. */
  focusId: string;
}

export default function PickupPointSelector({
  value,
  onChange,
  draft,
  onDraftChange,
  error,
  zip,
  focusId,
}: PickupPointSelectorProps) {
  const t = useTranslations('checkout.pickup');
  const tCheckout = useTranslations('checkout');
  const { provider, text: manualValue } = draft;
  const errorId = `${focusId}-error`;

  if (value) {
    return (
      <div className="flex flex-col gap-3 rounded-[--radius-md] border-2 border-teal bg-teal-pale/40 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text-dark">
            {t('selected', { provider: providerLabel(value.provider) })}
          </p>
          <p className="mt-1 break-words text-base text-text-dark">{value.name}</p>
          {value.address && <p className="text-sm text-text-mid">{value.address}</p>}
          {value.id !== value.name && (
            <p className="text-sm text-text-mid">{t('code', { code: value.id })}</p>
          )}
        </div>
        <button
          id={focusId}
          type="button"
          onClick={() => {
            onDraftChange({ provider: value.provider, text: value.id === value.name ? value.name : '' });
            onChange(null);
          }}
          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-[--radius-md] border-2 border-teal-deep px-5 py-2 text-sm font-semibold text-text-dark hover:bg-white cursor-pointer"
          aria-label={t('changeLabel')}
        >
          {t('change')}
        </button>
      </div>
    );
  }

  const current = getPickupProvider(provider);

  function confirmManual() {
    const point = pickupPointFromDraft(draft);
    if (point) onChange(point);
  }

  return (
    <div>
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-text-dark">{t('provider')}</legend>
        <div className="flex flex-wrap gap-3">
          {PICKUP_PROVIDERS.map((p) => (
            <label
              key={p.id}
              className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-[--radius-md] border-2 px-4 py-2 text-sm font-semibold text-text-dark ${
                provider === p.id ? 'border-teal bg-teal-pale/40' : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="pickup-provider"
                value={p.id}
                checked={provider === p.id}
                onChange={() => onDraftChange({ ...draft, provider: p.id })}
                className="accent-teal-deep"
              />
              {p.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-4">
        {current.hasWidget && current.id === 'boxnow' ? (
          <BoxNowWidget onSelect={onChange} zip={zip} buttonId={focusId} />
        ) : (
          <div>
            <label htmlFor={focusId} className="mb-1 block text-sm font-medium text-text-dark">
              {t('manualLabel', { provider: current.label })}
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                id={focusId}
                type="text"
                value={manualValue}
                onChange={(e) => onDraftChange({ ...draft, text: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    confirmManual();
                  }
                }}
                placeholder={t('manualPlaceholder')}
                aria-invalid={error ? true : undefined}
                aria-describedby={`${focusId}-hint${error ? ` ${errorId}` : ''}`}
                className={`w-full rounded-[--radius-sm] border bg-white px-4 py-3 font-body text-base text-text-dark placeholder:text-text-mid focus:outline-none focus:ring-2 ${
                  error ? 'border-red-500 focus:ring-red-300/40' : 'border-gray-200 focus:border-teal focus:ring-teal/30'
                }`}
              />
              <button
                type="button"
                onClick={confirmManual}
                className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-[--radius-md] border-2 border-teal-deep px-5 py-2 text-sm font-semibold text-text-dark hover:bg-teal-pale cursor-pointer"
              >
                {t('confirm')}
              </button>
            </div>
            <p id={`${focusId}-hint`} className="mt-2 text-sm text-text-mid">
              {t.rich('manualHint', {
                provider: current.label,
                link: (chunks) => (
                  <a
                    href={current.finderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-text-dark underline underline-offset-2 hover:text-teal-deep"
                  >
                    {chunks}
                    <span className="sr-only"> {tCheckout('opensInNewTab')}</span>
                  </a>
                ),
              })}
            </p>
          </div>
        )}
      </div>

      {error && (
        <p id={errorId} className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
