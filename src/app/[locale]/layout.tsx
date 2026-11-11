import type { Metadata } from 'next';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CookieBanner from '@/components/layout/CookieBanner';
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL, ogLocale } from '@/lib/site-metadata';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Site-wide defaults. A page that sets its own `openGraph` replaces this object
// (Next merges metadata shallowly), so pages should spread DEFAULT_OG_IMAGE into
// their own `openGraph.images` unless they have a better image.
// `alternates` is per page (see localeAlternates in src/lib/site-metadata.ts):
// a layout-level value would point every subpage at the home page.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.site' });

  return {
    metadataBase: new URL(SITE_URL),
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      siteName: SITE_NAME,
      locale: ogLocale(locale),
      type: 'website',
      images: [DEFAULT_OG_IMAGE],
    },
    // No twitter title/description: X falls back to og:title / og:description,
    // which pages override, so the card always matches the page.
    twitter: {
      card: 'summary_large_image',
      images: [DEFAULT_OG_IMAGE.url],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Unknown first segments (e.g. /robots.txt before it existed, /foo) are 404s,
  // not the home page served with 200.
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 pt-24 lg:pt-28">{children}</main>
        <Footer />
        <CookieBanner />
      </div>
    </NextIntlClientProvider>
  );
}
