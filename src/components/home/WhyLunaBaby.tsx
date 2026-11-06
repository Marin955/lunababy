'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Feather, RotateCcw, ShieldCheck, Truck, type LucideIcon } from 'lucide-react';

// One icon set site-wide (lucide, stroke 1.5). Icons are decorative: the heading carries the meaning.
const usps: { titleKey: string; descKey: string; Icon: LucideIcon }[] = [
  { titleKey: 'freeShipping', descKey: 'freeShippingDesc', Icon: Truck },
  { titleKey: 'organic', descKey: 'organicDesc', Icon: Feather },
  { titleKey: 'easyReturns', descKey: 'easyReturnsDesc', Icon: RotateCcw },
  { titleKey: 'safeTested', descKey: 'safeTestedDesc', Icon: ShieldCheck },
];

export default function WhyLunaBaby() {
  const t = useTranslations('home.whyUs');

  return (
    <section className="max-w-7xl mx-auto px-6 py-16 sm:py-20">
      <h2 className="font-heading text-3xl sm:text-4xl font-semibold text-text-dark text-center mb-10 sm:mb-12">
        {t('title')}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {usps.map(({ titleKey, descKey, Icon }) => (
          <div
            key={titleKey}
            className="flex flex-col items-center text-center p-8 rounded-lg bg-white shadow-sm"
          >
            <span className="w-16 h-16 mb-5 flex items-center justify-center rounded-full bg-teal-pale text-teal-ink">
              <Icon size={30} strokeWidth={1.5} aria-hidden="true" />
            </span>
            <h3 className="font-heading text-xl font-semibold text-text-dark mb-2">
              {t(titleKey)}
            </h3>
            <p className="text-[15px] text-text-mid leading-relaxed">
              {t(descKey)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
