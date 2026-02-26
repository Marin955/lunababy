import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.shipping' });

  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      siteName: 'LunaBaby',
      locale: locale === 'hr' ? 'hr_HR' : 'en_US',
      type: 'website',
    },
  };
}

export default async function ShippingInfoPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('shippingPage');

  const shippingMethods = [
    {
      key: 'standard' as const,
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
        </svg>
      ),
      hasFreeAbove: true,
    },
    {
      key: 'express' as const,
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
        </svg>
      ),
      hasFreeAbove: false,
    },
    {
      key: 'pickup' as const,
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
        </svg>
      ),
      hasFreeAbove: true,
    },
  ];

  return (
    <div>
      {/* Header */}
      <section className="bg-gradient-to-br from-teal-pale via-cream to-lavender-light/50">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h1 className="font-heading text-4xl font-bold text-text-dark mb-4">
            {t('title')}
          </h1>
          <p className="font-body text-lg text-text-mid max-w-2xl mx-auto leading-relaxed">
            {t('intro')}
          </p>
        </div>
      </section>

      {/* Shipping Methods */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="font-heading text-2xl font-semibold text-text-dark mb-8">
          {t('methods.title')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {shippingMethods.map(({ key, icon, hasFreeAbove }) => (
            <div
              key={key}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 flex flex-col"
            >
              <div className="w-12 h-12 rounded-xl bg-teal-pale flex items-center justify-center text-teal-deep mb-4">
                {icon}
              </div>
              <h3 className="font-heading text-lg font-semibold text-text-dark mb-2">
                {t(`methods.${key}.name`)}
              </h3>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold text-teal-deep">
                  {t(`methods.${key}.price`)}
                </span>
                <span className="text-sm text-text-light">|</span>
                <span className="text-sm text-text-mid">
                  {t(`methods.${key}.time`)}
                </span>
              </div>
              {hasFreeAbove && (
                <span className="inline-block text-xs font-medium text-teal-deep bg-teal-pale px-3 py-1 rounded-full mb-3 w-fit">
                  {t(`methods.${key}.freeAbove`)}
                </span>
              )}
              <p className="font-body text-sm text-text-mid leading-relaxed mt-auto">
                {t(`methods.${key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Free Shipping */}
      <section className="bg-teal-pale/40">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-deep/10 flex items-center justify-center text-teal-deep shrink-0">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
              </svg>
            </div>
            <div>
              <h2 className="font-heading text-2xl font-semibold text-text-dark mb-2">
                {t('freeShipping.title')}
              </h2>
              <p className="font-body text-text-mid leading-relaxed">
                {t('freeShipping.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Delivery Areas */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="font-heading text-2xl font-semibold text-text-dark mb-4">
          {t('deliveryAreas.title')}
        </h2>
        <div className="space-y-4 font-body text-text-mid leading-relaxed">
          <p>{t('deliveryAreas.description')}</p>
          <p className="text-sm italic">{t('deliveryAreas.international')}</p>
        </div>
      </section>

      {/* Packaging */}
      <section className="bg-cream/50">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <h2 className="font-heading text-2xl font-semibold text-text-dark mb-4">
            {t('packaging.title')}
          </h2>
          <p className="font-body text-text-mid leading-relaxed">
            {t('packaging.description')}
          </p>
        </div>
      </section>

      {/* Tracking */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="font-heading text-2xl font-semibold text-text-dark mb-4">
          {t('tracking.title')}
        </h2>
        <p className="font-body text-text-mid leading-relaxed">
          {t('tracking.description')}
        </p>
      </section>
    </div>
  );
}
