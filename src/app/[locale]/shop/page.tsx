import React from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { DEFAULT_OG_IMAGE, localeAlternates } from '@/lib/site-metadata';
import { getBundles } from '@/services/bundle-service';
import { fetchShippingMethods } from '@/services/api/shipping';
import { getFreeShippingThreshold } from '@/services/cart-service';
import { formatPrice } from '@/lib/utils';
import { Link } from '@/i18n/navigation';
import BundleGrid from '@/components/bundles/BundleGrid';
import type { Bundle } from '@/types';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'shop' });

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: localeAlternates(locale, '/shop'),
    openGraph: {
      title: t('metaTitle'),
      description: t('metaDescription'),
      siteName: 'LunaBaby',
      locale: locale === 'hr' ? 'hr_HR' : 'en_US',
      type: 'website',
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

const ICON_CLASS = 'h-6 w-6';

function TruckIcon() {
  return (
    <svg className={ICON_CLASS} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
    </svg>
  );
}

function ReturnIcon() {
  return (
    <svg className={ICON_CLASS} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className={ICON_CLASS} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  );
}

export default async function ShopPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('shop');

  const [bundlesResult, shippingResult] = await Promise.allSettled([
    getBundles(locale),
    fetchShippingMethods(locale),
  ]);
  const bundles: Bundle[] | null = bundlesResult.status === 'fulfilled' ? bundlesResult.value : null;
  const freeThreshold =
    shippingResult.status === 'fulfilled' ? getFreeShippingThreshold(shippingResult.value) : null;

  const trust = [
    // Only claim free shipping when the API actually has a threshold.
    freeThreshold !== null && {
      key: 'shipping',
      icon: <TruckIcon />,
      title: t('trust.shippingTitle', { amount: formatPrice(freeThreshold, locale) }),
      desc: t('trust.shippingDesc'),
      href: '/shipping-info',
    },
    {
      key: 'returns',
      icon: <ReturnIcon />,
      title: t('trust.returnsTitle'),
      desc: t('trust.returnsDesc'),
      href: '/returns',
    },
    {
      key: 'payment',
      icon: <LockIcon />,
      title: t('trust.paymentTitle'),
      desc: t('trust.paymentDesc'),
      href: null,
    },
  ].filter(Boolean) as { key: string; icon: React.ReactNode; title: string; desc: string; href: string | null }[];

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 lg:py-14">
      <header className="max-w-2xl mb-8 lg:mb-10">
        <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-semibold text-text-dark mb-3">
          {t('title')}
        </h1>
        <p className="text-base sm:text-lg text-text-mid leading-relaxed">{t('intro')}</p>
      </header>

      {bundles === null ? (
        <p className="rounded-[--radius-md] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {t('loadError')}
        </p>
      ) : bundles.length === 0 ? (
        <p className="text-text-mid">{t('empty')}</p>
      ) : (
        <BundleGrid bundles={bundles} locale={locale} />
      )}

      {/* Trust strip */}
      <section aria-label={t('trust.label')} className="mt-12 lg:mt-16">
        <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {trust.map(({ key, icon, title, desc, href }) => {
            const body = (
              <>
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-pale text-[var(--color-teal-ink,#3F7C87)]">
                  {icon}
                </span>
                <span>
                  <span className="block font-semibold text-text-dark">{title}</span>
                  <span className="block text-sm text-text-mid mt-0.5">{desc}</span>
                </span>
              </>
            );
            return (
              <li key={key}>
                {href ? (
                  <Link
                    href={href}
                    className="flex h-full items-center gap-4 rounded-[--radius-lg] bg-white p-5 shadow-sm transition-shadow hover:shadow-hover"
                  >
                    {body}
                  </Link>
                ) : (
                  <div className="flex h-full items-center gap-4 rounded-[--radius-lg] bg-white p-5 shadow-sm">
                    {body}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
