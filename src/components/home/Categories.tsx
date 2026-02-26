'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

const categories = [
  { key: 'clothing', emoji: '\uD83D\uDC76', gradient: 'from-blush-light to-lavender-pale' },
  { key: 'nursery', emoji: '\uD83D\uDECF\uFE0F', gradient: 'from-teal-pale to-lavender-pale' },
  { key: 'feeding', emoji: '\uD83C\uDF7C', gradient: 'from-gold-light to-blush-light' },
  { key: 'bath', emoji: '\uD83D\uDEC1', gradient: 'from-teal-pale to-teal-light' },
  { key: 'toys', emoji: '\uD83E\uDDF8', gradient: 'from-lavender-pale to-blush-light' },
  { key: 'onTheGo', emoji: '\uD83D\uDEBC', gradient: 'from-sage-light to-teal-pale' },
] as const;

export default function Categories() {
  const t = useTranslations('home.categories');

  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <h2 className="font-heading text-3xl sm:text-4xl font-semibold text-text-dark text-center mb-12">
        {t('title')}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(({ key, emoji, gradient }) => (
          <Link
            key={key}
            href="/shop"
            className={`
              group relative flex flex-col items-center justify-center
              p-8 rounded-[--radius-lg] bg-gradient-to-br ${gradient}
              hover:-translate-y-2 hover:shadow-hover
              transition-all duration-300
            `}
          >
            <span className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
              {emoji}
            </span>
            <span className="font-heading text-lg font-semibold text-text-dark">
              {t(key)}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
