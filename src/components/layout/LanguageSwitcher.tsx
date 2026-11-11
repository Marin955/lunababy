'use client';

import React from 'react';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { translateShopPath } from '@/lib/shop-paths';

const locales: Locale[] = ['hr', 'en'];

// Language names are shown in their own language, so they need no translation.
const languageNames: Record<Locale, string> = { hr: 'Hrvatski', en: 'English' };

export default function LanguageSwitcher() {
  const currentLocale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  function handleSwitch(targetLocale: Locale) {
    if (targetLocale === currentLocale) return;
    router.replace(translateShopPath(pathname, currentLocale, targetLocale), { locale: targetLocale });
  }

  return (
    <div className="inline-flex items-center gap-0.5 rounded-full bg-gray-100 p-0.5">
      {locales.map((loc) => {
        const isActive = loc === currentLocale;
        return (
          <button
            key={loc}
            type="button"
            onClick={() => handleSwitch(loc)}
            className={`
              inline-flex items-center justify-center min-w-[44px] min-h-[44px] px-3
              text-[13px] font-semibold rounded-full transition-colors duration-200 cursor-pointer
              ${isActive
                ? 'bg-[var(--color-teal-ink,#3F7C87)] text-white shadow-sm'
                : 'text-text-mid hover:text-text-dark'
              }
            `}
            lang={loc}
            aria-label={languageNames[loc]}
            aria-current={isActive ? 'true' : undefined}
          >
            {loc.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
