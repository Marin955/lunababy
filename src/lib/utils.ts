export function formatPrice(amount: number): string {
  return `\u20AC${amount.toFixed(2)}`;
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
