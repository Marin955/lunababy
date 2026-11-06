// Delivery estimate for the product page buy box (spec 005, D3).
//
// Pure functions with no imports, so the Node test runner can load this file directly
// (see delivery-estimate.test.mjs, run with `npm test`).

/** Orders placed before this hour (Europe/Zagreb) on a working day ship the same day. Source: FAQ copy. */
export const ORDER_CUTOFF_HOUR = 14;

export const SHOP_TIME_ZONE = 'Europe/Zagreb';

/**
 * Croatian public holidays (Zakon o blagdanima, spomendanima i neradnim danima) for 2026–2027.
 * Extend this list before 2028.
 */
export const CROATIAN_HOLIDAYS: ReadonlySet<string> = new Set([
  // 2026
  '2026-01-01', // Nova godina
  '2026-01-06', // Bogojavljenje
  '2026-04-05', // Uskrs
  '2026-04-06', // Uskrsni ponedjeljak
  '2026-05-01', // Praznik rada
  '2026-05-30', // Dan državnosti
  '2026-06-04', // Tijelovo
  '2026-06-22', // Dan antifašističke borbe
  '2026-08-05', // Dan pobjede i domovinske zahvalnosti
  '2026-08-15', // Velika Gospa
  '2026-11-01', // Svi sveti
  '2026-11-18', // Dan sjećanja na žrtve Domovinskog rata
  '2026-12-25', // Božić
  '2026-12-26', // Sveti Stjepan
  // 2027
  '2027-01-01',
  '2027-01-06',
  '2027-03-28', // Uskrs
  '2027-03-29', // Uskrsni ponedjeljak
  '2027-05-01',
  '2027-05-27', // Tijelovo
  '2027-05-30',
  '2027-06-22',
  '2027-08-05',
  '2027-08-15',
  '2027-11-01',
  '2027-11-18',
  '2027-12-25',
  '2027-12-26',
]);

/** A calendar date as YYYY-MM-DD. */
export type IsoDate = string;

export interface DeliveryEstimate {
  /** True when an order placed now still ships today. */
  beforeCutoff: boolean;
  /** Earliest delivery date (fastest method, lower bound). */
  earliest: IsoDate;
  /** Latest delivery date (slowest method, upper bound). Equal to `earliest` when there is no range. */
  latest: IsoDate;
}

/** Parses "3-5", "1–2", "2" or "2 dana" into [min, max] working days. Returns null when no number is found. */
export function parseEstimatedDays(value: string | null | undefined): [number, number] | null {
  if (!value) return null;
  const numbers = value.match(/\d+/g)?.map(Number) ?? [];
  if (numbers.length === 0) return null;
  const min = Math.min(...numbers);
  const max = Math.max(...numbers);
  return [min, max];
}

/** Local calendar date and hour of `now` in the shop's time zone. */
export function zonedDateAndHour(now: Date, timeZone: string = SHOP_TIME_ZONE): { date: IsoDate; hour: number } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return { date: `${get('year')}-${get('month')}-${get('day')}`, hour: Number(get('hour')) };
}

function toUtcDate(date: IsoDate): Date {
  return new Date(`${date}T00:00:00Z`);
}

function toIso(date: Date): IsoDate {
  return date.toISOString().slice(0, 10);
}

export function isWorkingDay(date: IsoDate, holidays: ReadonlySet<string> = CROATIAN_HOLIDAYS): boolean {
  const weekday = toUtcDate(date).getUTCDay();
  return weekday !== 0 && weekday !== 6 && !holidays.has(date);
}

/** Moves `days` working days forward from `date` (0 returns `date` unchanged). */
export function addWorkingDays(date: IsoDate, days: number, holidays: ReadonlySet<string> = CROATIAN_HOLIDAYS): IsoDate {
  const d = toUtcDate(date);
  let remaining = days;
  while (remaining > 0) {
    d.setUTCDate(d.getUTCDate() + 1);
    if (isWorkingDay(toIso(d), holidays)) remaining -= 1;
  }
  return toIso(d);
}

/**
 * Delivery window for an order placed at `now`.
 *
 * The parcel ships on the dispatch day: today when it is a working day before the cutoff,
 * otherwise the next working day. Delivery takes the methods' `estimated_days` in working days
 * after dispatch. The window runs from the fastest method's lower bound to the slowest method's
 * upper bound. Returns null when no method has a usable estimate.
 */
export function estimateDelivery(
  estimatedDays: ReadonlyArray<string | null | undefined>,
  now: Date,
  options: { cutoffHour?: number; timeZone?: string; holidays?: ReadonlySet<string> } = {}
): DeliveryEstimate | null {
  const { cutoffHour = ORDER_CUTOFF_HOUR, timeZone = SHOP_TIME_ZONE, holidays = CROATIAN_HOLIDAYS } = options;

  const ranges = estimatedDays.map(parseEstimatedDays).filter((r): r is [number, number] => r !== null);
  if (ranges.length === 0) return null;

  const fastest = Math.min(...ranges.map(([min]) => min));
  const slowest = Math.max(...ranges.map(([, max]) => max));

  const { date: today, hour } = zonedDateAndHour(now, timeZone);
  const beforeCutoff = isWorkingDay(today, holidays) && hour < cutoffHour;
  const dispatch = beforeCutoff ? today : addWorkingDays(today, 1, holidays);

  return {
    beforeCutoff,
    earliest: addWorkingDays(dispatch, fastest, holidays),
    latest: addWorkingDays(dispatch, slowest, holidays),
  };
}
