import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.returns' });

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

export default async function ReturnsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('returnsPage');

  const conditions = t.raw('conditions.items') as string[];
  const steps = t.raw('process.steps') as Array<{
    title: string;
    description: string;
  }>;

  return (
    <div>
      {/* Header */}
      <section className="bg-gradient-to-br from-cream via-lavender-light/30 to-teal-pale/30">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h1 className="font-heading text-4xl font-bold text-text-dark mb-4">
            {t('title')}
          </h1>
        </div>
      </section>

      {/* Overview */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="font-heading text-2xl font-semibold text-text-dark mb-4">
          {t('overview.title')}
        </h2>
        <p className="font-body text-text-mid leading-relaxed">
          {t('overview.description')}
        </p>
      </section>

      {/* Conditions */}
      <section className="bg-cream/50">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <h2 className="font-heading text-2xl font-semibold text-text-dark mb-6">
            {t('conditions.title')}
          </h2>
          <ul className="space-y-3">
            {conditions.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-teal-pale text-teal-deep flex items-center justify-center mt-0.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </span>
                <span className="font-body text-text-mid leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Return Process Steps */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="font-heading text-2xl font-semibold text-text-dark mb-10 text-center">
          {t('process.title')}
        </h2>
        <div className="space-y-8">
          {steps.map((step, index) => (
            <div key={index} className="flex items-start gap-5">
              <div className="shrink-0 w-10 h-10 rounded-full bg-teal-deep text-white flex items-center justify-center font-heading font-bold text-lg">
                {index + 1}
              </div>
              <div className="pt-1">
                <h3 className="font-heading text-lg font-semibold text-text-dark mb-1">
                  {step.title}
                </h3>
                <p className="font-body text-text-mid leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Refund */}
      <section className="bg-teal-pale/30">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <h2 className="font-heading text-2xl font-semibold text-text-dark mb-4">
            {t('refund.title')}
          </h2>
          <div className="space-y-4 font-body text-text-mid leading-relaxed">
            <p>{t('refund.description')}</p>
            <p className="text-sm bg-white/70 rounded-xl p-4 border border-gray-100">
              {t('refund.shippingCosts')}
            </p>
          </div>
        </div>
      </section>

      {/* Exchange */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="font-heading text-2xl font-semibold text-text-dark mb-4">
          {t('exchange.title')}
        </h2>
        <p className="font-body text-text-mid leading-relaxed">
          {t('exchange.description')}
        </p>
      </section>

      {/* Exceptions */}
      <section className="bg-cream/50">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <h2 className="font-heading text-xl font-semibold text-text-dark mb-3">
            {t('exceptions.title')}
          </h2>
          <p className="font-body text-sm text-text-mid leading-relaxed">
            {t('exceptions.description')}
          </p>
        </div>
      </section>
    </div>
  );
}
