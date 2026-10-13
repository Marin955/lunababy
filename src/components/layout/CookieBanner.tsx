'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { readConsent, saveConsent, type ConsentChoice } from '@/lib/consent';

export default function CookieBanner() {
  const t = useTranslations('cookies');
  // Decided after mount: the consent cookie isn't known during server rendering.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(readConsent() === null);
  }, []);

  if (!visible) return null;

  const choose = (choice: ConsentChoice) => {
    saveConsent(choice);
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={t('title')}
      className="fixed inset-x-0 bottom-0 z-[70] p-4 sm:p-6 pointer-events-none"
    >
      <div className="pointer-events-auto max-w-3xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 p-5 sm:flex sm:items-center sm:gap-6">
        <p className="text-sm text-text-mid leading-relaxed flex-1 mb-4 sm:mb-0">
          {t('text')}{' '}
          <Link href="/privacy" className="text-teal-deep underline underline-offset-2 hover:text-teal whitespace-nowrap">
            {t('more')}
          </Link>
        </p>
        {/* Equal-weight buttons: rejecting must be as easy as accepting (GDPR). */}
        <div className="flex gap-3 shrink-0">
          <button
            type="button"
            onClick={() => choose('essential')}
            className="flex-1 sm:flex-none px-5 py-2.5 text-sm font-semibold rounded-[--radius-md] border-2 border-teal text-teal-deep hover:bg-teal-pale transition-colors cursor-pointer"
          >
            {t('reject')}
          </button>
          <button
            type="button"
            onClick={() => choose('all')}
            className="flex-1 sm:flex-none px-5 py-2.5 text-sm font-semibold rounded-[--radius-md] bg-teal-deep text-white hover:bg-teal transition-colors cursor-pointer"
          >
            {t('accept')}
          </button>
        </div>
      </div>
    </div>
  );
}
