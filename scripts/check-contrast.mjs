#!/usr/bin/env node
// Prints WCAG 2.x contrast ratios for every text/background token pair used on
// the storefront, read straight from src/app/globals.css so the numbers always
// match the shipped tokens. Exits non-zero if any pair is below its minimum.
//
//   node scripts/check-contrast.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const css = readFileSync(fileURLToPath(new URL('../src/app/globals.css', import.meta.url)), 'utf8');
const tokens = Object.fromEntries(
  [...css.matchAll(/--color-([\w-]+):\s*(#[0-9a-fA-F]{6})/g)].map(([, name, hex]) => [name, hex]),
);
tokens.white = '#FFFFFF';

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

// Backgrounds that carry text on public pages.
const surfaces = ['cream', 'warm-white', 'white', 'teal-pale', 'lavender-pale', 'gold-light'];
// [foreground, backgrounds, minimum ratio]; 4.5 = body text, 3 = text >= 24px.
const pairs = [
  ['text-dark', surfaces, 4.5],
  ['text-mid', surfaces, 4.5],
  ['text-light', surfaces, 4.5],
  ['teal-ink', [...surfaces, 'teal-light'], 4.5],
  ['teal-deep', [...surfaces, 'teal-light'], 4.5],
  ['white', ['teal-ink', 'teal-ink-hover', 'teal-deep', 'sale'], 4.5],
  ['lavender-ink', ['lavender-light', 'lavender-pale', 'white'], 4.5],
  ['sale', ['sale-light', 'white', 'cream'], 4.5],
];

let failed = 0;
console.log('fg'.padEnd(16) + 'bg'.padEnd(16) + 'ratio'.padStart(7) + '   min');
for (const [fg, bgs, min] of pairs) {
  for (const bg of bgs) {
    if (!tokens[fg] || !tokens[bg]) {
      console.log(`missing token: ${tokens[fg] ? bg : fg}`);
      failed++;
      continue;
    }
    const r = ratio(tokens[fg], tokens[bg]);
    const ok = r >= min;
    if (!ok) failed++;
    console.log(`${fg.padEnd(16)}${bg.padEnd(16)}${r.toFixed(2).padStart(7)}   ${min}  ${ok ? 'ok' : 'FAIL'}`);
  }
}
if (failed) {
  console.error(`\n${failed} pair(s) below minimum`);
  process.exit(1);
}
console.log('\nAll pairs pass.');
