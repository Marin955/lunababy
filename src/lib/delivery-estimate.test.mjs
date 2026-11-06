// Unit tests for delivery-estimate.ts. Run with `npm test` (Node's built-in test runner;
// Node >= 22.18 strips the TypeScript types itself, so no extra dependency is needed).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  addWorkingDays,
  estimateDelivery,
  isWorkingDay,
  parseEstimatedDays,
  zonedDateAndHour,
} from './delivery-estimate.ts';

const METHODS = ['3-5', '1-2', '1-2']; // standard, express, paketomat (seeds)

test('parseEstimatedDays handles ranges, single values and junk', () => {
  assert.deepEqual(parseEstimatedDays('3-5'), [3, 5]);
  assert.deepEqual(parseEstimatedDays('1–2 radna dana'), [1, 2]);
  assert.deepEqual(parseEstimatedDays('2'), [2, 2]);
  assert.equal(parseEstimatedDays(''), null);
  assert.equal(parseEstimatedDays(null), null);
  assert.equal(parseEstimatedDays('soon'), null);
});

test('zonedDateAndHour uses Europe/Zagreb, including DST', () => {
  // 12:30 UTC in winter = 13:30 in Zagreb (CET)
  assert.deepEqual(zonedDateAndHour(new Date('2026-11-10T12:30:00Z')), { date: '2026-11-10', hour: 13 });
  // 12:30 UTC in summer = 14:30 in Zagreb (CEST)
  assert.deepEqual(zonedDateAndHour(new Date('2026-07-07T12:30:00Z')), { date: '2026-07-07', hour: 14 });
  // 23:30 UTC = next day in Zagreb
  assert.deepEqual(zonedDateAndHour(new Date('2026-11-10T23:30:00Z')), { date: '2026-11-11', hour: 0 });
});

test('weekends and Croatian holidays are not working days', () => {
  assert.equal(isWorkingDay('2026-11-07'), false); // Saturday
  assert.equal(isWorkingDay('2026-11-08'), false); // Sunday
  assert.equal(isWorkingDay('2026-11-18'), false); // Dan sjećanja (Wednesday)
  assert.equal(isWorkingDay('2026-11-17'), true);
  assert.equal(isWorkingDay('2027-03-29'), false); // Uskrsni ponedjeljak
});

test('addWorkingDays skips weekends and holidays', () => {
  assert.equal(addWorkingDays('2026-11-06', 1), '2026-11-09'); // Fri + 1 → Mon
  assert.equal(addWorkingDays('2026-11-17', 1), '2026-11-19'); // skips 18 Nov
  assert.equal(addWorkingDays('2026-12-23', 2), '2026-12-28'); // skips 25–27 Dec
  assert.equal(addWorkingDays('2026-11-10', 0), '2026-11-10');
});

test('before the cutoff on a working day the parcel ships today', () => {
  // Tuesday 10 Nov 2026, 09:00 Zagreb
  const result = estimateDelivery(METHODS, new Date('2026-11-10T08:00:00Z'));
  assert.deepEqual(result, { beforeCutoff: true, earliest: '2026-11-11', latest: '2026-11-17' });
});

test('after the cutoff the parcel ships the next working day', () => {
  // Tuesday 10 Nov 2026, 15:00 Zagreb → dispatch Wed 11; +1 = Thu 12; +5 = Thu 19 (skips 18 Nov holiday)
  const result = estimateDelivery(METHODS, new Date('2026-11-10T14:00:00Z'));
  assert.deepEqual(result, { beforeCutoff: false, earliest: '2026-11-12', latest: '2026-11-19' });
});

test('exactly at the cutoff counts as after it', () => {
  const result = estimateDelivery(['1-2'], new Date('2026-11-10T13:00:00Z')); // 14:00 Zagreb
  assert.equal(result?.beforeCutoff, false);
});

test('orders on a weekend ship on Monday', () => {
  // Saturday 7 Nov 2026, 10:00 Zagreb → dispatch Mon 9
  const result = estimateDelivery(METHODS, new Date('2026-11-07T09:00:00Z'));
  assert.deepEqual(result, { beforeCutoff: false, earliest: '2026-11-10', latest: '2026-11-16' });
});

test('a single method without a range gives one date', () => {
  const result = estimateDelivery(['2'], new Date('2026-11-10T08:00:00Z'));
  assert.equal(result?.earliest, '2026-11-12');
  assert.equal(result?.latest, '2026-11-12');
});

test('returns null when no method has an estimate', () => {
  assert.equal(estimateDelivery([], new Date()), null);
  assert.equal(estimateDelivery([null, 'n/a'], new Date()), null);
});

test('a custom cutoff hour is respected', () => {
  const result = estimateDelivery(['1'], new Date('2026-11-10T10:00:00Z'), { cutoffHour: 10 }); // 11:00 Zagreb
  assert.equal(result?.beforeCutoff, false);
});
