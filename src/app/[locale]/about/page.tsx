import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.about' });

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

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('about');

  const values = [
    {
      key: 'value1' as const,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
        </svg>
      ),
    },
    {
      key: 'value2' as const,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
        </svg>
      ),
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-teal-pale via-cream to-lavender-light">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-text-dark mb-4">
            {t('heroTitle')}
          </h1>
          <p className="font-body text-lg text-text-mid max-w-2xl mx-auto leading-relaxed">
            {t('heroSubtitle')}
          </p>
        </div>
      </section>


      {/* Our Values */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="font-heading text-3xl font-semibold text-text-dark mb-10 text-center">
          {t('ourValues.title')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {values.map(({ key, icon }) => (
            <div
              key={key}
              className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300"
            >
              <div className="w-14 h-14 rounded-xl bg-teal-pale flex items-center justify-center text-teal-deep mb-5">
                {icon}
              </div>
              <h3 className="font-heading text-xl font-semibold text-text-dark mb-3">
                {t(`ourValues.${key}.title`)}
              </h3>
              <p className="font-body text-text-mid leading-relaxed">
                {t(`ourValues.${key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
