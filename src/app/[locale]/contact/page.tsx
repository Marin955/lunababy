import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { DEFAULT_OG_IMAGE, localeAlternates } from '@/lib/site-metadata';
import type React from 'react';
import ContactForm from '@/components/content/ContactForm';
import { company } from '@/lib/company';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.contact' });

  return {
    title: t('title'),
    description: t('description'),
    alternates: localeAlternates(locale, '/contact'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      siteName: 'LunaBaby',
      locale: locale === 'hr' ? 'hr_HR' : 'en_US',
      type: 'website',
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('contactPage');

  const emailIcon = (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
  );
  const phoneIcon = (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
    </svg>
  );
  const hours = company.hours ? company.hours[locale === 'hr' ? 'hr' : 'en'] : null;

  // Contact details come from src/lib/company.ts; a channel without a value is not shown.
  const contactCards = [
    company.email && {
      icon: emailIcon,
      label: t('email.label'),
      value: company.email,
      description: t('email.description'),
      href: `mailto:${company.email}`,
    },
    company.phone && {
      icon: phoneIcon,
      label: t('phone.label'),
      value: company.phone,
      // Owner-supplied hours replace the generic "on business days" note.
      description: hours ? `${t('hours.label')}: ${hours}` : t('phone.description'),
      href: `tel:${company.phone.replace(/[^\d+]/g, '')}`,
    },
  ].filter((card): card is { icon: React.ReactElement; label: string; value: string; description: string; href: string } => Boolean(card));

  const companyLines = [company.legalName, company.oib ? `OIB: ${company.oib}` : null, company.address, company.register].filter(
    (line): line is string => Boolean(line)
  );

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
            {contactCards.map((card) => (
              <a
                key={card.href}
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
                  <p className="font-body text-sm text-text-mid mt-0.5">
                    {card.description}
                  </p>
                </div>
              </a>
            ))}


            {/* Response time */}
            <p className="text-sm text-text-mid italic px-4 -mx-4">
              {t('responseTime')}
            </p>

            {companyLines.length > 0 && (
              <div className="pt-2">
                <h2 className="font-heading text-sm font-semibold text-text-dark mb-1">{t('companyTitle')}</h2>
                <address className="not-italic font-body text-sm text-text-mid leading-relaxed">
                  {companyLines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </address>
              </div>
            )}
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
