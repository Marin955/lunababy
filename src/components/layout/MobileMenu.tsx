'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { Link, usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useCartStore } from '@/stores/cart-store';
import LanguageSwitcher from '@/components/layout/LanguageSwitcher';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const navLinks = [
  { key: 'home', href: '/' },
  { key: 'shop', href: '/shop' },
  { key: 'about', href: '/about' },
  { key: 'faq', href: '/faq' },
  { key: 'shippingInfo', href: '/shipping-info' },
  { key: 'returns', href: '/returns' },
  { key: 'contact', href: '/contact' },
  { key: 'privacy', href: '/privacy' },
] as const;

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const t = useTranslations('common');
  const tCart = useTranslations('cart');
  const pathname = usePathname();
  const items = useCartStore((state) => state.items);
  const isHydrated = useCartStore((state) => state.isHydrated);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on route change
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  return (
    <div
      className={`
        fixed inset-0 z-[60] transition-opacity duration-300
        ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
      `}
      aria-hidden={!isOpen}
    >
      {/* Background overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-label={t('buttons.close')}
      />

      {/* Menu panel */}
      <div
        className={`
          absolute top-0 right-0 h-full w-80 max-w-full bg-white shadow-xl
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Header: Logo + Close */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <Link href="/" className="flex items-center gap-2" onClick={onClose}>
              <Image
                src="/logo.png"
                alt="LunaBaby"
                width={32}
                height={32}
                className="h-8 w-auto"
              />
              <span className="font-heading text-lg font-semibold text-text-dark">
                LunaBaby
              </span>
            </Link>

            <button
              type="button"
              onClick={onClose}
              className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
              aria-label={t('buttons.close')}
            >
              <svg
                className="w-6 h-6 text-text-mid"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation links */}
          <nav className="flex-1 px-4 py-4">
            <ul className="space-y-1">
              {navLinks.map(({ key, href }) => {
                const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
                return (
                  <li key={key}>
                    <Link
                      href={href}
                      onClick={onClose}
                      className={`
                        block py-3 px-3 text-lg font-medium rounded-[--radius-sm] transition-colors duration-200 border-b border-gray-50
                        ${isActive
                          ? 'text-teal-deep bg-teal-pale/50'
                          : 'text-text-dark hover:text-teal-deep hover:bg-teal-pale/30'
                        }
                      `}
                    >
                      {t(`nav.${key}`)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Bottom section: Cart + Language */}
          <div className="border-t border-gray-100 px-4 py-4 space-y-3">
            {/* Cart link */}
            <Link
              href="/cart"
              onClick={onClose}
              className="flex items-center gap-3 py-3 px-3 text-lg font-medium text-text-dark hover:text-teal-deep hover:bg-teal-pale/30 rounded-[--radius-sm] transition-colors duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <span>{tCart('title')}</span>
              {isHydrated && totalItems > 0 && (
                <span className="ml-auto min-w-[24px] h-6 px-1.5 flex items-center justify-center bg-teal-deep text-white text-xs font-semibold rounded-full">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Language Switcher */}
            <div className="px-3">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
