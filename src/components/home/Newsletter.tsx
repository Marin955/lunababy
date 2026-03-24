'use client';

import React, { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { subscribe } from '@/services/api/newsletter';

export default function Newsletter() {
  const t = useTranslations('newsletter');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setStatus('error');
      setErrorMessage(t('error'));
      return;
    }

    setStatus('loading');
    setErrorMessage(null);

    try {
      await subscribe(email.trim(), locale);
      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
      setErrorMessage(t('error'));
    }
  }

  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <div className="rounded-[--radius-lg] bg-gradient-to-br from-teal-light/30 to-lavender-light/40 p-8 sm:p-12 lg:p-16">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-heading text-3xl sm:text-4xl font-semibold text-text-dark mb-4">
            {t('title')}
          </h2>

          <p className="text-text-mid mb-8 leading-relaxed">
            {t('description')}
          </p>

          {status === 'success' ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-14 h-14 bg-teal-pale rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 text-teal-deep"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-teal-deep font-medium">
                {t('success')}
              </p>
            </div>
          ) : (
            <>
              <form
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
                noValidate
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === 'error') {
                      setStatus('idle');
                      setErrorMessage(null);
                    }
                  }}
                  placeholder={t('placeholder')}
                  disabled={status === 'loading'}
                  className={`
                    flex-1 px-4 py-3 rounded-[--radius-sm] border bg-white
                    focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal
                    transition-all font-body text-text-dark placeholder:text-text-light
                    ${status === 'error' ? 'border-red-400' : 'border-gray-200'}
                    ${status === 'loading' ? 'opacity-50' : ''}
                  `}
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="px-6 py-3 bg-teal-deep text-white font-semibold rounded-[--radius-sm] hover:bg-teal shadow-md hover:shadow-hover hover:-translate-y-0.5 transition-all duration-300 cursor-pointer whitespace-nowrap disabled:opacity-50"
                >
                  {status === 'loading' ? '...' : tCommon('buttons.subscribe')}
                </button>
              </form>

              {errorMessage && (
                <p className="text-red-500 text-sm mt-3">{errorMessage}</p>
              )}

              <p className="text-xs text-text-light mt-4">
                {t('privacyNote')}
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
