import React from 'react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export default async function NotFoundPage() {
  const t = await getTranslations('error');

  return (
    <div className="max-w-2xl mx-auto px-6 py-16 text-center">
      <div className="text-6xl mb-6">404</div>
      <h1 className="font-heading text-2xl font-semibold text-text-dark mb-3">
        {t('notFound')}
      </h1>
      <p className="text-text-mid mb-6">{t('notFoundMessage')}</p>
      <Link
        href="/"
        className="inline-flex px-6 py-3 bg-teal-deep text-white font-semibold rounded-[--radius-md] hover:bg-teal transition-colors"
      >
        {t('backHome')}
      </Link>
    </div>
  );
}
