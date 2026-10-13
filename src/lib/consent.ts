// Cookie consent, stored in a first-party cookie so the server can read it later too.
// Only optional scripts (e.g. future analytics) need to check this; essential storage
// (cart, login) does not require consent.

export type ConsentChoice = 'all' | 'essential';

const COOKIE_NAME = 'lb_consent';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 180; // ask again after ~6 months

export function readConsent(): ConsentChoice | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=(all|essential)`));
  return match ? (match[1] as ConsentChoice) : null;
}

export function saveConsent(choice: ConsentChoice): void {
  document.cookie = `${COOKIE_NAME}=${choice}; Max-Age=${MAX_AGE_SECONDS}; Path=/; SameSite=Lax`;
  window.dispatchEvent(new CustomEvent('lb-consent-change', { detail: choice }));
}

export function hasAnalyticsConsent(): boolean {
  return readConsent() === 'all';
}
