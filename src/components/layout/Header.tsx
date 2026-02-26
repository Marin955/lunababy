'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Link, usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import CartIcon from '@/components/cart/CartIcon';
import LanguageSwitcher from '@/components/layout/LanguageSwitcher';
import MobileMenu from '@/components/layout/MobileMenu';

const navLinks = [
  { key: 'home', href: '/' },
  { key: 'shop', href: '/shop' },
  { key: 'about', href: '/about' },
  { key: 'contact', href: '/contact' },
] as const;

export default function Header() {
  const t = useTranslations('common.nav');
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  return (
    <>
      <header
        className={`
          fixed top-0 w-full z-50 transition-all duration-300
          ${scrolled
            ? 'bg-white/80 backdrop-blur-md shadow-sm'
            : 'bg-white/70 backdrop-blur-sm'
          }
        `}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <Image
                src="/logo.png"
                alt="LunaBaby"
                width={40}
                height={40}
                className="h-10 w-auto"
              />
              <span className="font-heading text-xl font-semibold text-text-dark">
                LunaBaby
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map(({ key, href }) => {
                const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
                return (
                  <Link
                    key={key}
                    href={href}
                    className={`
                      text-sm font-medium transition-colors duration-200
                      hover:text-teal-deep
                      ${isActive ? 'text-teal-deep' : 'text-text-mid'}
                    `}
                  >
                    {t(key)}
                  </Link>
                );
              })}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Language Switcher - Desktop only */}
              <div className="hidden lg:block">
                <LanguageSwitcher />
              </div>

              {/* Cart Icon - visible on both mobile and desktop */}
              <CartIcon />

              {/* Mobile hamburger - visible below lg */}
              <button
                type="button"
                className="lg:hidden flex flex-col items-center justify-center w-11 h-11 gap-1.5 cursor-pointer"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
                aria-expanded={mobileMenuOpen}
              >
                <span
                  className={`
                    block w-5 h-0.5 bg-text-dark transition-all duration-300 origin-center
                    ${mobileMenuOpen ? 'rotate-45 translate-y-[4px]' : ''}
                  `}
                />
                <span
                  className={`
                    block w-5 h-0.5 bg-text-dark transition-all duration-300
                    ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'}
                  `}
                />
                <span
                  className={`
                    block w-5 h-0.5 bg-text-dark transition-all duration-300 origin-center
                    ${mobileMenuOpen ? '-rotate-45 -translate-y-[4px]' : ''}
                  `}
                />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Full-screen overlay mobile menu */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={closeMobileMenu} />
    </>
  );
}
