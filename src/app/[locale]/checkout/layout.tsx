import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { DEFAULT_OG_IMAGE, localeAlternates } from '@/lib/site-metadata';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.checkout' });

  return {
    title: t('title'),
    description: t('description'),
    alternates: localeAlternates(locale, '/checkout'),
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

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
