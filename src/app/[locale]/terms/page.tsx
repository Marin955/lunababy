import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { DEFAULT_OG_IMAGE, localeAlternates } from '@/lib/site-metadata';
import type { ReactNode } from 'react';
import { Link } from '@/i18n/navigation';
import { company } from '@/lib/company';
import CopyTextButton from './CopyTextButton';

// Bump whenever the terms text changes.
const TERMS_LAST_UPDATED = '2026-11-07';

// Keep the page out of search results until the owner (ideally with a lawyer) approves the text (spec 005, O8).
const TERMS_NOINDEX = true;

// The EU ODR platform (ec.europa.eu/consumers/odr) was shut down on 20 July 2025 by Regulation (EU) 2024/3228,
// along with the duty to link to it. Leave this null unless an equivalent link becomes required again.
const ODR_URL: string | null = null;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.terms' });

  return {
    title: t('title'),
    description: t('description'),
    robots: TERMS_NOINDEX ? { index: false, follow: true } : undefined,
    alternates: localeAlternates(locale, '/terms'),
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

const linkClass = 'font-medium text-teal-deep underline underline-offset-2 hover:text-teal';

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('terms');

  const email = company.email ?? '';
  const mail = (chunks: ReactNode) => (
    <a href={`mailto:${email}`} className={linkClass}>
      {chunks}
    </a>
  );
  const paragraphs = (key: string) => t.raw(`${key}.paragraphs`) as string[];

  const lastUpdated = new Intl.DateTimeFormat(locale === 'hr' ? 'hr-HR' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Zagreb',
  }).format(new Date(`${TERMS_LAST_UPDATED}T12:00:00Z`));

  // Seller details: only the fields the owner has filled in are shown.
  const sellerRows = [
    { label: t('seller.labels.legalName'), value: company.legalName },
    { label: t('seller.labels.oib'), value: company.oib },
    { label: t('seller.labels.address'), value: company.address },
    { label: t('seller.labels.register'), value: company.register },
    { label: t('seller.labels.representative'), value: company.representative },
    { label: t('seller.labels.email'), value: company.email, href: company.email ? `mailto:${company.email}` : undefined },
    { label: t('seller.labels.phone'), value: company.phone, href: company.phone ? `tel:${company.phone.replace(/[^\d+]/g, '')}` : undefined },
    { label: t('seller.labels.hours'), value: company.hours ? company.hours[locale === 'hr' ? 'hr' : 'en'] : null },
  ].filter((row): row is { label: string; value: string; href?: string } => Boolean(row.value));

  const recipient = [company.legalName ?? 'LunaBaby', company.address, company.email].filter(Boolean).join(', ');
  const formLines = (t.raw('withdrawal.form.lines') as string[]).map((line) => line.replace('{recipient}', recipient));
  const formText = formLines.join('\n');

  const sections: { id: string; title: string; body: ReactNode }[] = [
    {
      id: 'seller',
      title: t('seller.title'),
      body: (
        <>
          <p>{t('seller.intro')}</p>
          <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 rounded-xl border border-gray-100 bg-white p-5 sm:grid-cols-[auto_1fr]">
            {sellerRows.map((row) => (
              <div key={row.label} className="contents">
                <dt className="text-sm font-semibold text-text-dark">{row.label}</dt>
                <dd className="mb-2 sm:mb-0">
                  {row.href ? (
                    <a href={row.href} className={linkClass}>
                      {row.value}
                    </a>
                  ) : (
                    row.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
          {company.vatNote && <p className="mt-3 text-sm">{company.vatNote}</p>}
        </>
      ),
    },
    { id: 'ordering', title: t('ordering.title'), body: paragraphs('ordering').map((p) => <p key={p}>{p}</p>) },
    {
      id: 'prices',
      title: t('prices.title'),
      body: (
        <>
          {paragraphs('prices').map((p) => (
            <p key={p}>{p}</p>
          ))}
          {company.vatNote && <p>{company.vatNote}</p>}
        </>
      ),
    },
    { id: 'payment', title: t('payment.title'), body: paragraphs('payment').map((p) => <p key={p}>{p}</p>) },
    {
      id: 'delivery',
      title: t('delivery.title'),
      body: paragraphs('delivery').map((_, i) => (
        <p key={i}>
          {t.rich(`delivery.paragraphs.${i}`, {
            shipping: (chunks) => (
              <Link href="/shipping-info" className={linkClass}>
                {chunks}
              </Link>
            ),
          })}
        </p>
      )),
    },
    {
      id: 'withdrawal',
      title: t('withdrawal.title'),
      body: (
        <>
          {paragraphs('withdrawal').map((_, i) => (
            <p key={i}>{t.rich(`withdrawal.paragraphs.${i}`, { email, mail })}</p>
          ))}

          <div className="rounded-xl bg-teal-pale/40 p-5">
            <h3 className="mb-2 font-heading text-lg font-semibold text-text-dark">{t('withdrawal.goodwill.title')}</h3>
            <p>
              {t.rich('withdrawal.goodwill.text', {
                returns: (chunks) => (
                  <Link href="/returns" className={linkClass}>
                    {chunks}
                  </Link>
                ),
              })}
            </p>
          </div>

          <div id="withdrawal-form" className="scroll-mt-24">
            <h3 className="mb-2 font-heading text-lg font-semibold text-text-dark">{t('withdrawal.form.title')}</h3>
            <p className="mb-4">{t('withdrawal.form.intro')}</p>
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="space-y-3 text-sm text-text-dark select-all">
                {formLines.map((line, i) => (
                  <p key={i} className={i === 0 ? 'font-semibold' : undefined}>
                    {line}
                  </p>
                ))}
              </div>
              <div className="mt-5">
                <CopyTextButton text={formText} label={t('withdrawal.form.copy')} copiedLabel={t('withdrawal.form.copied')} />
              </div>
            </div>
          </div>
        </>
      ),
    },
    { id: 'warranty', title: t('warranty.title'), body: paragraphs('warranty').map((p) => <p key={p}>{p}</p>) },
    {
      id: 'complaints',
      title: t('complaints.title'),
      body: (
        <>
          {company.email && <p>{t.rich('complaints.email', { email, mail })}</p>}
          {company.address && <p>{t('complaints.post', { address: company.address })}</p>}
          <p>{t('complaints.response')}</p>
        </>
      ),
    },
    {
      id: 'disputes',
      title: t('disputes.title'),
      body: (
        <>
          {paragraphs('disputes').map((p) => (
            <p key={p}>{p}</p>
          ))}
          {ODR_URL && (
            <p>
              {t.rich('disputes.odr', {
                url: ODR_URL,
                odr: (chunks) => (
                  <a href={ODR_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>
                    {chunks}
                  </a>
                ),
              })}
            </p>
          )}
        </>
      ),
    },
    { id: 'law', title: t('law.title'), body: paragraphs('law').map((p) => <p key={p}>{p}</p>) },
  ];

  return (
    <div>
      <section className="bg-gradient-to-br from-cream via-lavender-light/30 to-teal-pale/30">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h1 className="mb-4 font-heading text-4xl font-bold text-text-dark">{t('title')}</h1>
          <p className="text-sm text-text-mid">{t('lastUpdated', { date: lastUpdated })}</p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-6 py-12">
        <p className="font-body leading-relaxed text-text-mid">
          {t.rich('intro', {
            privacy: (chunks) => (
              <Link href="/privacy" className={linkClass}>
                {chunks}
              </Link>
            ),
          })}
        </p>

        <nav aria-labelledby="terms-toc" className="mt-8 rounded-2xl border border-gray-100 bg-cream/40 p-5">
          <h2 id="terms-toc" className="mb-2 font-heading text-lg font-semibold text-text-dark">
            {t('toc')}
          </h2>
          <ol className="sm:columns-2 sm:gap-x-6">
            {sections.map((section, i) => (
              <li key={section.id}>
                <a href={`#${section.id}`} className="flex min-h-11 items-center text-sm text-text-mid hover:text-teal-deep sm:min-h-0 sm:py-1">
                  {i + 1}. {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {sections.map((section, i) => (
          <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`} className="mt-12 scroll-mt-24">
            <h2 id={`${section.id}-title`} className="mb-4 font-heading text-2xl font-semibold text-text-dark">
              {i + 1}. {section.title}
            </h2>
            <div className="space-y-4 font-body leading-relaxed text-text-mid">{section.body}</div>
          </section>
        ))}
      </div>
    </div>
  );
}
