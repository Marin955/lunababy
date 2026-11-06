'use client';

import React from 'react';
import { Link } from '@/i18n/navigation';
import { useLocale, useTranslations } from 'next-intl';
import PaymentIcons from '@/components/layout/PaymentIcons';
import { company } from '@/lib/company';
import { TERMS_HREF, WITHDRAWAL_HREF } from '@/lib/constants';

// ≥ 44px tap targets on mobile come from vertical padding/min-height, not a bigger font.
const linkClass =
  'flex min-h-11 items-center text-sm text-text-mid hover:text-teal-deep transition-colors duration-200 md:min-h-0 md:py-1';
const headingClass = 'font-heading text-base font-semibold text-text-dark mb-2 md:mb-4';
const listClass = 'md:space-y-2';

function InstagramIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export default function Footer() {
  const t = useTranslations('common');
  const locale = useLocale();

  const helpLinks = [
    { label: t('nav.shippingInfo'), href: '/shipping-info' },
    { label: t('nav.returns'), href: '/returns' },
    { label: t('nav.faq'), href: '/faq' },
    { label: t('nav.trackOrder'), href: '/order-lookup' },
    { label: t('nav.contact'), href: '/contact' },
  ];

  const legalLinks = [
    { label: t('nav.about'), href: '/about' },
    { label: t('nav.terms'), href: TERMS_HREF },
    { label: t('footer.withdrawal'), href: WITHDRAWAL_HREF },
    { label: t('nav.privacy'), href: '/privacy' },
    { label: t('footer.disputes'), href: `${TERMS_HREF}#disputes` },
  ];

  // Only links the owner has configured; never the generic instagram.com / facebook.com.
  const socialLinks = [
    { label: 'Instagram', href: company.social.instagram, icon: <InstagramIcon /> },
    { label: 'Facebook', href: company.social.facebook, icon: <FacebookIcon /> },
  ].filter((s): s is { label: string; href: string; icon: React.ReactElement } => Boolean(s.href));

  const companyLines = [
    company.legalName,
    company.oib ? t('footer.oib', { value: company.oib }) : null,
    company.address,
    company.register,
  ].filter((line): line is string => Boolean(line));

  const hours = company.hours ? company.hours[locale === 'hr' ? 'hr' : 'en'] : null;

  return (
    <footer className="bg-[#F5F3F0] border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* Brand + company details */}
          <div>
            <Link href="/" className="inline-flex min-h-11 items-center mb-2 md:mb-4">
              <span className="font-heading text-xl font-semibold text-text-dark">LunaBaby</span>
            </Link>
            <p className="text-sm text-text-mid leading-relaxed">{t('footer.description')}</p>

            {companyLines.length > 0 && (
              <address className="not-italic mt-4 text-sm text-text-mid leading-relaxed">
                {companyLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
            )}

            {socialLinks.length > 0 && (
              <div className="mt-6">
                <p className="sr-only">{t('footer.socialFollow')}</p>
                <div className="flex items-center gap-2">
                  {socialLinks.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-11 h-11 flex items-center justify-center rounded-xl bg-teal/10 text-teal-deep hover:bg-teal/20 transition-colors duration-200"
                      aria-label={s.label}
                    >
                      {s.icon}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Help */}
          <nav aria-labelledby="footer-help">
            <h2 id="footer-help" className={headingClass}>
              {t('footer.helpLinks')}
            </h2>
            <ul className={listClass}>
              {helpLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Company & legal */}
          <nav aria-labelledby="footer-legal">
            <h2 id="footer-legal" className={headingClass}>
              {t('footer.legalLinks')}
            </h2>
            <ul className={listClass}>
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          {(company.email || company.phone) && (
            <div>
              <h2 className={headingClass}>{t('footer.contactTitle')}</h2>
              <ul className={listClass}>
                {company.email && (
                  <li>
                    <a href={`mailto:${company.email}`} className={linkClass}>
                      {company.email}
                    </a>
                  </li>
                )}
                {company.phone && (
                  <li>
                    <a href={`tel:${company.phone.replace(/[^\d+]/g, '')}`} className={linkClass}>
                      {company.phone}
                    </a>
                  </li>
                )}
              </ul>
              {hours && <p className="mt-2 text-sm text-text-mid">{hours}</p>}
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div className="mt-10 md:mt-12 pt-8 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-text-mid">{t('footer.copyright')}</p>
          <PaymentIcons label={t('footer.paymentMethods')} />
        </div>
      </div>
    </footer>
  );
}
