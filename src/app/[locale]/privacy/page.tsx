import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.privacy' });

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

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('privacyPage');

  const dataCollectionItems = t.raw('dataCollection.items') as string[];
  const cookieItems = t.raw('cookies.items') as string[];
  const usageItems = t.raw('usage.items') as string[];
  const sharingItems = t.raw('sharing.items') as string[];
  const rightsItems = t.raw('rights.items') as string[];

  const listSections = [
    {
      key: 'dataCollection',
      title: t('dataCollection.title'),
      description: t('dataCollection.description'),
      items: dataCollectionItems,
    },
    {
      key: 'cookies',
      title: t('cookies.title'),
      description: t('cookies.description'),
      items: cookieItems,
      note: t('cookies.note'),
    },
    {
      key: 'usage',
      title: t('usage.title'),
      description: t('usage.description'),
      items: usageItems,
    },
    {
      key: 'sharing',
      title: t('sharing.title'),
      description: t('sharing.description'),
      items: sharingItems,
    },
  ];

  return (
    <div>
      {/* Header */}
      <section className="bg-gradient-to-br from-cream via-lavender-light/30 to-teal-pale/30">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h1 className="font-heading text-4xl font-bold text-text-dark mb-4">
            {t('title')}
          </h1>
          <p className="font-body text-sm text-text-light">
            {t('lastUpdated')}
          </p>
        </div>
      </section>

      {/* Intro */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <p className="font-body text-text-mid leading-relaxed">
          {t('intro')}
        </p>
      </section>

      {/* Sections with lists */}
      {listSections.map((section, sectionIndex) => (
        <section
          key={section.key}
          className={sectionIndex % 2 === 0 ? 'bg-cream/30' : ''}
        >
          <div className="max-w-4xl mx-auto px-6 py-12">
            <h2 className="font-heading text-2xl font-semibold text-text-dark mb-4">
              {section.title}
            </h2>
            <p className="font-body text-text-mid leading-relaxed mb-4">
              {section.description}
            </p>
            <ul className="space-y-3 ml-1">
              {section.items.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-teal-deep mt-2.5" />
                  <span className="font-body text-text-mid leading-relaxed text-sm">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
            {section.note && (
              <p className="font-body text-sm text-text-light mt-4 italic">
                {section.note}
              </p>
            )}
          </div>
        </section>
      ))}

      {/* Data Retention */}
      <section>
        <div className="max-w-4xl mx-auto px-6 py-12">
          <h2 className="font-heading text-2xl font-semibold text-text-dark mb-4">
            {t('retention.title')}
          </h2>
          <p className="font-body text-text-mid leading-relaxed">
            {t('retention.description')}
          </p>
        </div>
      </section>

      {/* Your Rights */}
      <section className="bg-cream/30">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <h2 className="font-heading text-2xl font-semibold text-text-dark mb-4">
            {t('rights.title')}
          </h2>
          <p className="font-body text-text-mid leading-relaxed mb-4">
            {t('rights.description')}
          </p>
          <ul className="space-y-3 ml-1">
            {rightsItems.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-teal-deep mt-2.5" />
                <span className="font-body text-text-mid leading-relaxed text-sm">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Contact for Data Protection */}
      <section>
        <div className="max-w-4xl mx-auto px-6 py-12">
          <h2 className="font-heading text-2xl font-semibold text-text-dark mb-4">
            {t('contact.title')}
          </h2>
          <p className="font-body text-text-mid leading-relaxed mb-3">
            {t('contact.description')}
          </p>
          <a
            href={`mailto:${t('contact.email')}`}
            className="inline-block font-body text-teal-deep font-semibold hover:underline mb-4"
          >
            {t('contact.email')}
          </a>
          <p className="font-body text-sm text-text-light leading-relaxed">
            {t('contact.note')}
          </p>
        </div>
      </section>
    </div>
  );
}
