import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import ContactForm from '@/components/content/ContactForm';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.contact' });

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

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('contactPage');

  const contactCards = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
        </svg>
      ),
      label: t('email.label'),
      value: t('email.value'),
      description: t('email.description'),
      href: `mailto:${t('email.value')}`,
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
        </svg>
      ),
      label: t('supportEmail.label'),
      value: t('supportEmail.value'),
      description: t('supportEmail.description'),
      href: `mailto:${t('supportEmail.value')}`,
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
        </svg>
      ),
      label: t('phone.label'),
      value: t('phone.value'),
      description: t('phone.description'),
      href: `tel:${t('phone.value').replace(/\s/g, '')}`,
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

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Contact Info - left side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Cards */}
            {contactCards.map((card, index) => (
              <a
                key={index}
                href={card.href}
                className="flex items-start gap-4 p-4 rounded-xl hover:bg-teal-pale/30 transition-colors duration-200 -mx-4"
              >
                <div className="w-10 h-10 rounded-lg bg-teal-pale flex items-center justify-center text-teal-deep shrink-0">
                  {card.icon}
                </div>
                <div>
                  <p className="font-heading text-sm font-semibold text-text-dark">
                    {card.label}
                  </p>
                  <p className="font-body text-teal-deep text-sm font-medium">
                    {card.value}
                  </p>
                  <p className="font-body text-xs text-text-light mt-0.5">
                    {card.description}
                  </p>
                </div>
              </a>
            ))}

            {/* Hours */}
            <div className="p-4 -mx-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-teal-pale flex items-center justify-center text-teal-deep shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </div>
                <div>
                  <p className="font-heading text-sm font-semibold text-text-dark mb-1">
                    {t('hours.label')}
                  </p>
                  <div className="font-body text-sm text-text-mid space-y-0.5">
                    <p>{t('hours.weekdays')}</p>
                    <p>{t('hours.saturday')}</p>
                    <p>{t('hours.sunday')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="p-4 -mx-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-teal-pale flex items-center justify-center text-teal-deep shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                </div>
                <div>
                  <p className="font-heading text-sm font-semibold text-text-dark mb-1">
                    {t('address.label')}
                  </p>
                  <div className="font-body text-sm text-text-mid space-y-0.5">
                    <p>{t('address.street')}</p>
                    <p>{t('address.city')}</p>
                    <p>{t('address.country')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Response time */}
            <p className="text-sm text-text-light italic px-4 -mx-4">
              {t('responseTime')}
            </p>
          </div>

          {/* Contact Form - right side */}
          <div className="lg:col-span-3 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
