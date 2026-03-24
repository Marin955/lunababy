'use client';

import React from 'react';
import { Link, usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

const navItems = [
  { key: 'dashboard', href: '/admin' },
  { key: 'orders', href: '/admin/orders' },
  { key: 'bundles', href: '/admin/bundles' },
  { key: 'promoCodes', href: '/admin/promo-codes' },
] as const;

export default function AdminNav() {
  const t = useTranslations('admin.nav');
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2 mb-8">
      {navItems.map(({ key, href }) => {
        const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href));
        return (
          <Link
            key={key}
            href={href}
            className={`px-4 py-2 rounded-[--radius-sm] text-sm font-medium transition-colors ${
              isActive
                ? 'bg-teal-deep text-white'
                : 'bg-gray-100 text-text-mid hover:bg-gray-200'
            }`}
          >
            {t(key)}
          </Link>
        );
      })}
    </nav>
  );
}
