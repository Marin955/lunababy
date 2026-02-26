import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import FaqAccordion from '@/components/content/FaqAccordion';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.faq' });

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

export default async function FaqPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('faq');

  const items = t.raw('items') as Array<{ question: string; answer: string }>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="font-heading text-4xl font-bold text-text-dark mb-10 text-center">
        {t('title')}
      </h1>

      <FaqAccordion items={items} />
    </div>
  );
}
