'use client';

import React from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import PaymentIcons from '@/components/layout/PaymentIcons';

export default function Footer() {
  const t = useTranslations('common');

  const helpLinks = [
    { label: t('nav.shippingInfo'), href: '/shipping-info' },
    { label: t('nav.returns'), href: '/returns' },
    { label: t('nav.faq'), href: '/faq' },
    { label: t('nav.contact'), href: '/contact' },
  ];

  const companyLinks = [
    { label: t('nav.about'), href: '/about' },
    { label: t('nav.privacy'), href: '/privacy' },
  ];


  return (
    <footer className="bg-[#F5F3F0] border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <span className="font-heading text-xl font-semibold text-text-dark">
                LunaBaby
              </span>
            </Link>
            <p className="text-sm text-text-mid leading-relaxed mb-6">
              {t('footer.description')}
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-2">
              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 flex items-center justify-center rounded-xl bg-teal/10 text-teal-deep hover:bg-teal/20 transition-colors duration-200"
                aria-label="Instagram"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  viewBox="0 0 24 24"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="5" />
                  <circle
                    cx="17.5"
                    cy="6.5"
                    r="1.5"
                    fill="currentColor"
                    stroke="none"
                  />
                </svg>
              </a>

              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 flex items-center justify-center rounded-xl bg-teal/10 text-teal-deep hover:bg-teal/20 transition-colors duration-200"
                aria-label="Facebook"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Help Column */}
          <div>
            <h4 className="font-heading text-base font-semibold text-text-dark mb-4">
              {t('footer.helpLinks')}
            </h4>
            <ul className="space-y-3">
              {helpLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-mid hover:text-teal-deep transition-colors duration-200 inline-block py-1"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="font-heading text-base font-semibold text-text-dark mb-4">
              {t('footer.companyLinks')}
            </h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-mid hover:text-teal-deep transition-colors duration-200 inline-block py-1"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-text-light">{t('footer.copyright')}</p>

          {/* Payment Icons */}
          <PaymentIcons />
        </div>
      </div>
    </footer>
  );
}
