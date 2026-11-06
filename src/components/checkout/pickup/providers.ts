import type { OrderPickupPoint, OrderPickupPointProvider } from '@/types';

export type PickupPoint = OrderPickupPoint;
export type PickupProviderId = OrderPickupPointProvider;

/**
 * One parcel-locker network. A provider with a `widget` lets the customer pick
 * a locker on the provider's own map; the others fall back to typing the
 * locker's name or code, with a link to the provider's public locker finder.
 */
export interface PickupProvider {
  id: PickupProviderId;
  label: string;
  /** Public page where customers can look up lockers. */
  finderUrl: string;
  /** True when an embeddable picker is configured for this provider. */
  hasWidget: boolean;
}

// BoxNow's map widget needs a partner id (owner input O6). Without it the
// checkout uses the manual fallback.
export const BOXNOW_PARTNER_ID = process.env.NEXT_PUBLIC_BOXNOW_PARTNER_ID || null;

export const PICKUP_PROVIDERS: PickupProvider[] = [
  {
    id: 'boxnow',
    label: 'BOX NOW',
    finderUrl: 'https://boxnow.hr/',
    hasWidget: Boolean(BOXNOW_PARTNER_ID),
  },
  {
    // No public embeddable picker for GLS in Croatia; ParcelShop API access is owner input O6.
    id: 'gls',
    label: 'GLS',
    finderUrl: 'https://gls-group.com/HR/hr/gls-points/',
    hasWidget: false,
  },
];

export function getPickupProvider(id: PickupProviderId): PickupProvider {
  return PICKUP_PROVIDERS.find((p) => p.id === id) ?? PICKUP_PROVIDERS[0];
}

export function providerLabel(id: string): string {
  return PICKUP_PROVIDERS.find((p) => p.id === id)?.label ?? id;
}
