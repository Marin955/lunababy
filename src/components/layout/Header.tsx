'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Link, usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/auth-store';
import CartIcon from '@/components/cart/CartIcon';
import LanguageSwitcher from '@/components/layout/LanguageSwitcher';
import MobileMenu from '@/components/layout/MobileMenu';
import MiniCart from '@/components/cart/MiniCart';
import { SHOP_HREF } from '@/lib/constants';

const navLinks = [
  { key: 'shop', href: SHOP_HREF },
  { key: 'home', href: '/' },
  { key: 'trackOrder', href: '/order-lookup' },
  { key: 'about', href: '/about' },
  { key: 'contact', href: '/contact' },
] as const;

export default function Header() {
  const t = useTranslations('common.nav');
  const tAuth = useTranslations('auth');
  const tHome = useTranslations('home');
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const signOutAction = useAuthStore((state) => state.signOut);

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
        {/* Free delivery announcement bar */}
        <div className="h-8 flex items-center justify-center bg-[var(--color-teal-ink,#3F7C87)] text-white text-[13px] sm:text-sm font-medium px-4 text-center">
          {tHome('freeDeliveryBar')}
        </div>

        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0 min-h-[44px]">
              <Image
                src="/logo.svg"
                unoptimized
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
            <nav className="hidden lg:flex items-center gap-7">
              {navLinks.map(({ key, href }) => {
                const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
                return (
                  <Link
                    key={key}
                    href={href}
                    aria-current={isActive ? 'page' : undefined}
                    className={`
                      inline-flex items-center min-h-[44px] text-sm font-semibold transition-colors duration-200
                      hover:text-[var(--color-teal-ink,#3F7C87)]
                      ${isActive ? 'text-[var(--color-teal-ink,#3F7C87)] underline decoration-2 underline-offset-8' : 'text-text-mid'}
                    `}
                  >
                    {t(key)}
                  </Link>
                );
              })}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Auth links - Desktop only */}
              <div className="hidden lg:flex items-center gap-3">
                {isAuthenticated ? (
                  <>
                    {user?.role === 'admin' && (
                      <Link
                        href="/admin"
                        className="inline-flex items-center min-h-[44px] text-sm font-medium text-amber-700 hover:text-amber-800 transition-colors"
                      >
                        Admin
                      </Link>
                    )}
                    <Link
                      href="/profile"
                      className="inline-flex items-center min-h-[44px] text-sm font-medium text-text-mid hover:text-[var(--color-teal-ink,#3F7C87)] transition-colors"
                    >
                      {user?.name || tAuth('profile')}
                    </Link>
                    <button
                      type="button"
                      onClick={signOutAction}
                      className="inline-flex items-center min-h-[44px] text-sm font-medium text-text-mid hover:text-red-600 transition-colors cursor-pointer"
                    >
                      {tAuth('signOut')}
                    </button>
                  </>
                ) : (
                  <Link
                    href="/signin"
                    className="inline-flex items-center min-h-[44px] text-sm font-medium text-text-mid hover:text-[var(--color-teal-ink,#3F7C87)] transition-colors"
                  >
                    {tAuth('signIn')}
                  </Link>
                )}
              </div>

              {/* Language Switcher - Desktop only */}
              <div className="hidden lg:block">
                <LanguageSwitcher />
              </div>

              {/* Cart Icon - visible on both mobile and desktop */}
              <CartIcon />
              {/* Add-to-cart drawer; opens on cartStore.lastAdded */}
              <MiniCart />

              {/* Mobile hamburger - visible below lg */}
              <button
                type="button"
                className="lg:hidden flex flex-col items-center justify-center w-11 h-11 gap-1.5 cursor-pointer"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Menu"
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
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
