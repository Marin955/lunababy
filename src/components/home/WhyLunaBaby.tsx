'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

const usps = [
  { titleKey: 'freeShipping', descKey: 'freeShippingDesc', emoji: '\uD83D\uDE9A' },
  { titleKey: 'organic', descKey: 'organicDesc', emoji: '\uD83C\uDF3F' },
  { titleKey: 'easyReturns', descKey: 'easyReturnsDesc', emoji: '\u21A9\uFE0F' },
  { titleKey: 'safeTested', descKey: 'safeTestedDesc', emoji: '\uD83D\uDEE1\uFE0F' },
] as const;

export default function WhyLunaBaby() {
  const t = useTranslations('home.whyUs');

  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <h2 className="font-heading text-3xl sm:text-4xl font-semibold text-text-dark text-center mb-12">
        {t('title')}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {usps.map(({ titleKey, descKey, emoji }) => (
          <div
            key={titleKey}
            className="flex flex-col items-center text-center p-8 rounded-[--radius-lg] bg-white shadow-sm hover:shadow-hover hover:-translate-y-1 transition-all duration-300"
          >
            <span className="text-4xl mb-4">{emoji}</span>
            <h3 className="font-heading text-lg font-semibold text-text-dark mb-2">
              {t(titleKey)}
            </h3>
            <p className="text-sm text-text-mid leading-relaxed">
              {t(descKey)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
