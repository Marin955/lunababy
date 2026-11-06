'use client';

import React, { useEffect, useId } from 'react';
import { useTranslations } from 'next-intl';
import { BOXNOW_PARTNER_ID } from './providers';
import type { PickupPoint } from './providers';

// Official BOX NOW map widget (https://boxnow.hr/diy/widget/developers): the
// script reads `window._bn_map_widget_config`, opens the map from any element
// with the configured button class and calls `afterSelect` with the locker.
const SCRIPT_SRC = 'https://widget-cdn.boxnow.hr/map-widget/client/v5.js';

interface BoxNowLocker {
  boxnowLockerId?: string | number;
  boxnowLockerName?: string;
  boxnowLockerAddressLine1?: string;
  boxnowLockerPostalCode?: string;
  boxnowLockerCity?: string;
}

declare global {
  interface Window {
    _bn_map_widget_config?: Record<string, unknown>;
  }
}

interface BoxNowWidgetProps {
  onSelect: (point: PickupPoint) => void;
  /** Postal code from the address form, to centre the map. */
  zip?: string;
  buttonId?: string;
}

export default function BoxNowWidget({ onSelect, zip, buttonId }: BoxNowWidgetProps) {
  const t = useTranslations('checkout.pickup');
  const reactId = useId().replace(/[^a-zA-Z0-9]/g, '');
  const containerId = `boxnowmap-${reactId}`;
  const buttonClass = `boxnow-open-${reactId}`;

  useEffect(() => {
    window._bn_map_widget_config = {
      partnerId: Number(BOXNOW_PARTNER_ID) || BOXNOW_PARTNER_ID,
      parentElement: `#${containerId}`,
      buttonSelector: `.${buttonClass}`,
      type: 'iframe',
      autoclose: true,
      gps: !zip,
      ...(zip ? { zip } : {}),
      afterSelect: (selected: BoxNowLocker) => {
        const id = selected.boxnowLockerId != null ? String(selected.boxnowLockerId) : '';
        if (!id) return;
        const address = [
          selected.boxnowLockerAddressLine1,
          [selected.boxnowLockerPostalCode, selected.boxnowLockerCity].filter(Boolean).join(' '),
        ]
          .filter(Boolean)
          .join(', ');
        onSelect({
          provider: 'boxnow',
          id,
          name: selected.boxnowLockerName || `BOX NOW ${id}`,
          address: address || null,
        });
      },
    };

    // The script binds to the button when it loads, so load it after the config exists.
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    existing?.remove();
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    document.head.appendChild(script);
    return () => {
      script.remove();
    };
  }, [containerId, buttonClass, zip, onSelect]);

  return (
    <div>
      <button
        id={buttonId}
        type="button"
        className={`${buttonClass} inline-flex min-h-11 items-center justify-center rounded-[--radius-md] border-2 border-teal-deep px-5 py-2.5 text-sm font-semibold text-text-dark hover:bg-teal-pale cursor-pointer`}
      >
        {t('openMap')}
      </button>
      <div id={containerId} className="mt-3" />
    </div>
  );
}
