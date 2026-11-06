import React from 'react';
import { getTranslations } from 'next-intl/server';
import { getShippingMethods } from '@/services/shipping-service';
import { estimateDelivery, ORDER_CUTOFF_HOUR, type IsoDate } from '@/lib/delivery-estimate';

interface DeliveryEstimateProps {
  locale: string;
}

function formatDay(date: IsoDate, locale: string): string {
  // The ISO date is a calendar day, so format it in UTC to avoid shifting it.
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'hr-HR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`));
}

/**
 * "Order by 14:00 and it arrives between {date} and {date}". Rendered on the server per request
 * (the product page is force-dynamic), so the date always matches the time of the visit.
 * Renders nothing when shipping methods can't be loaded.
 */
export default async function DeliveryEstimate({ locale }: DeliveryEstimateProps) {
  const t = await getTranslations({ locale, namespace: 'bundle.delivery' });

  let estimate;
  try {
    const methods = await getShippingMethods(locale);
    estimate = estimateDelivery(methods.map((m) => m.estimated_days), new Date());
  } catch {
    return null;
  }
  if (!estimate) return null;

  const from = formatDay(estimate.earliest, locale);
  const to = formatDay(estimate.latest, locale);
  const cutoff = `${String(ORDER_CUTOFF_HOUR).padStart(2, '0')}:00`;
  const lead = estimate.beforeCutoff ? t('beforeCutoff', { cutoff }) : t('afterCutoff');
  const when = estimate.earliest === estimate.latest ? from : t('range', { from, to });

  return (
    <div className="flex items-start gap-3 rounded-[--radius-sm] bg-white border border-gray-200 px-4 py-3">
      <svg
        className="w-6 h-6 flex-shrink-0 text-text-mid mt-0.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h11v9H3zM14 10h4l3 3v3h-7M7.5 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM17.5 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
      </svg>
      <div>
        <p className="text-sm text-text-dark">
          {lead} <strong className="font-semibold">{when}</strong>
        </p>
        <p className="text-[13px] text-text-mid mt-0.5">{t('note')}</p>
      </div>
    </div>
  );
}
