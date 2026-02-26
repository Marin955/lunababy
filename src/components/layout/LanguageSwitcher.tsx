'use client';

import React from 'react';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';

const locales: Locale[] = ['hr', 'en'];

export default function LanguageSwitcher() {
  const currentLocale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  function handleSwitch(targetLocale: Locale) {
    if (targetLocale === currentLocale) return;
    router.replace(pathname, { locale: targetLocale });
  }

  return (
    <div className="flex items-center gap-1 rounded-full bg-gray-100 p-0.5">
      {locales.map((loc) => {
        const isActive = loc === currentLocale;
        return (
          <button
            key={loc}
            type="button"
            onClick={() => handleSwitch(loc)}
            className={`
              px-4 py-2 text-xs font-semibold rounded-full transition-all duration-200 cursor-pointer
              ${isActive
                ? 'bg-teal-deep text-white shadow-sm'
                : 'text-text-mid hover:text-teal-deep'
              }
            `}
            aria-label={`Switch language to ${loc.toUpperCase()}`}
            aria-current={isActive ? 'true' : undefined}
          >
            {loc.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
