/**
 * Format integer cents to localized euro string.
 * e.g., formatPrice(8990, 'hr') → "89,90 EUR"
 *       formatPrice(8990, 'en') → "89.90 EUR"
 */
export function formatPrice(cents: number, locale: string = 'hr'): string {
  const euros = cents / 100;
  if (locale === 'en') {
    return `${euros.toFixed(2)} EUR`;
  }
  return `${euros.toFixed(2).replace('.', ',')} EUR`;
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
