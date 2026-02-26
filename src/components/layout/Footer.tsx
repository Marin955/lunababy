'use client';

import React from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('common');

  const shopLinks = [
    { label: t('footer.newArrivals'), href: '/shop' },
    { label: t('footer.bestsellers'), href: '/shop' },
    { label: t('footer.giftSets'), href: '/shop' },
  ];

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

  const paymentMethods = ['VISA', 'MasterCard', 'AMEX', 'PayPal', 'Klarna'];

  return (
    <footer className="bg-[#F5F3F0] border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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

              {/* Pinterest */}
              <a
                href="https://pinterest.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 flex items-center justify-center rounded-xl bg-teal/10 text-teal-deep hover:bg-teal/20 transition-colors duration-200"
                aria-label="Pinterest"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0C5.373 0 0 5.372 0 12c0 4.99 3.657 9.128 8.438 9.878-.046-.75-.088-1.902.018-2.72.096-.745.62-4.746.62-4.746s-.158-.317-.158-.784c0-.735.426-1.283.957-1.283.45 0 .668.34.668.746 0 .454-.29 1.134-.44 1.764-.124.527.265.957.786.957 1.003 0 1.676-1.29 1.676-2.82 0-1.164-.784-2.037-2.21-2.037-1.612 0-2.617 1.2-2.617 2.545 0 .463.136.79.348 1.043.098.116.111.163.076.296l-.117.457c-.038.148-.148.2-.274.145-.725-.296-1.062-1.09-1.062-1.983 0-1.473 1.243-3.24 3.71-3.24 1.984 0 3.287 1.435 3.287 2.975 0 2.04-1.132 3.565-2.8 3.565-.562 0-1.09-.304-1.27-.649l-.372 1.473c-.128.462-.378.927-.588 1.287A12.03 12.03 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Shop Column */}
          <div>
            <h4 className="font-heading text-base font-semibold text-text-dark mb-4">
              {t('footer.shopLinks')}
            </h4>
            <ul className="space-y-3">
              {shopLinks.map((link) => (
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
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {paymentMethods.map((method) => (
              <span
                key={method}
                className="px-2.5 py-1 text-[10px] font-semibold text-text-mid bg-cream rounded-md border border-gray-100 tracking-wide uppercase"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
