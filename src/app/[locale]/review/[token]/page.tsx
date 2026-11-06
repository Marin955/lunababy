import React from 'react';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Button from '@/components/ui/Button';
import ReviewForm from '@/components/reviews/ReviewForm';
import { fetchReviewForm } from '@/services/api/reviews';
import { SHOP_HREF } from '@/lib/constants';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ locale: string; token: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'reviews.form' });
  // Token pages are private: never index them or leak the token through referrers.
  return { title: `${t('pageTitle')} | LunaBaby`, robots: { index: false, follow: false }, referrer: 'no-referrer' };
}

export default async function ReviewTokenPage({ params }: Props) {
  const { locale, token } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'reviews.form' });
  const lookup = await fetchReviewForm(token, locale);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      {lookup.state === 'open' ? (
        <>
          <p className="text-sm font-semibold uppercase tracking-wide text-text-mid mb-2">{t('eyebrow')}</p>
          <h1 className="font-heading text-3xl sm:text-4xl font-semibold text-text-dark mb-3">
            {lookup.context.bundle.name}
          </h1>
          <p className="text-text-mid leading-relaxed mb-8">{t('intro')}</p>
          <div className="bg-white rounded-[--radius-md] shadow-sm p-5 sm:p-8">
            <ReviewForm token={token} context={lookup.context} />
          </div>
        </>
      ) : (
        <div className="text-center">
          <h1 className="font-heading text-3xl font-semibold text-text-dark mb-4">{t('unavailableTitle')}</h1>
          <p className="text-text-mid leading-relaxed mb-8">
            {lookup.state === 'used'
              ? t('errors.used')
              : lookup.state === 'expired'
                ? t('errors.expired')
                : lookup.state === 'not_found'
                  ? t('errors.notFound')
                  : t('errors.generic')}
          </p>
          <Button href={SHOP_HREF} variant="outline">
            {t('backToShop')}
          </Button>
        </div>
      )}
    </div>
  );
}
