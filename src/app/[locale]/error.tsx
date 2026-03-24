'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('error');

  return (
    <div className="max-w-2xl mx-auto px-6 py-16 text-center">
      <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h1 className="font-heading text-2xl font-semibold text-text-dark mb-3">
        {t('generic')}
      </h1>
      <p className="text-text-mid mb-6">{t('tryAgain')}</p>
      <button
        type="button"
        onClick={reset}
        className="px-6 py-3 bg-teal-deep text-white font-semibold rounded-[--radius-md] hover:bg-teal transition-colors cursor-pointer"
      >
        {t('retry')}
      </button>
    </div>
  );
}
