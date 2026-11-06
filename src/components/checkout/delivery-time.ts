/**
 * The number that decides the plural form of "business days" for an
 * `estimated_days` value such as "1-2", "3-5" or "2": the upper bound
 * (spec 005 §0.8). Returns null when no number can be read.
 *
 * The message itself is an ICU plural (`checkout.shipping.deliveryTime`):
 * Croatian plural rules map 1/21/31… to "radni dan", 2–4/22–24… to
 * "radna dana" and everything else (incl. 11–14) to "radnih dana".
 */
export function deliveryDaysUpperBound(estimatedDays: string): number | null {
  const numbers = estimatedDays.match(/\d+/g);
  if (!numbers) return null;
  return Math.max(...numbers.map(Number));
}

/** "1-2" → "1–2" (en dash) for display. */
export function formatDayRange(estimatedDays: string): string {
  return estimatedDays.trim().replace(/\s*-\s*/g, '–');
}
