'use client';

import React from 'react';
import { Link } from '@/i18n/navigation';
import type { Bundle } from '@/types';
import { formatPrice } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import AddToCartButton from '@/components/bundles/AddToCartButton';

interface BundleCardProps {
  bundle: Bundle;
  locale: string;
}

function getGradientClasses(colorFrom: string, colorTo: string): string {
  const fromMap: Record<string, string> = {
    'teal-light': 'from-teal-light',
    'teal-pale': 'from-teal-pale',
    'lavender-pale': 'from-lavender-pale',
    'gold-light': 'from-gold-light',
    'blush-light': 'from-blush-light',
    'sage-light': 'from-sage-light',
  };
  const toMap: Record<string, string> = {
    'teal-light': 'to-teal-light',
    'teal-pale': 'to-teal-pale',
    'lavender-light': 'to-lavender-light',
    'lavender-pale': 'to-lavender-pale',
    'gold-light': 'to-gold-light',
    'blush-light': 'to-blush-light',
    'sage-light': 'to-sage-light',
  };
  return `${fromMap[colorFrom] || 'from-teal-pale'} ${toMap[colorTo] || 'to-lavender-pale'}`;
}

export default function BundleCard({ bundle, locale }: BundleCardProps) {
  const loc = locale as 'hr' | 'en';

  return (
    <div className="group bg-white rounded-[--radius-lg] shadow-sm overflow-hidden hover:shadow-hover hover:-translate-y-1 transition-all duration-300 flex flex-col">
      {/* Gradient top with emoji */}
      <Link href={`/shop/${bundle.slug}`} className="block relative">
        <div
          className={`relative h-48 bg-gradient-to-br ${getGradientClasses(bundle.colorFrom, bundle.colorTo)} flex items-center justify-center`}
        >
          <span className="text-7xl group-hover:scale-110 transition-transform duration-300">
            {bundle.emoji}
          </span>

          {/* Badge overlay */}
          {bundle.badge && (
            <div className="absolute top-4 left-4">
              <Badge type={bundle.badge} />
            </div>
          )}
        </div>
      </Link>

      {/* Card body */}
      <div className="flex flex-col flex-1 p-5">
        <Link href={`/shop/${bundle.slug}`}>
          <h3 className="font-heading text-lg font-semibold text-text-dark mb-1 group-hover:text-teal-deep transition-colors duration-200">
            {bundle.name[loc]}
          </h3>
        </Link>

        <p className="text-sm text-text-mid leading-relaxed mb-4 flex-1">
          {bundle.shortDescription[loc]}
        </p>

        {/* Price */}
        <div className="flex items-center gap-2 mb-4">
          {bundle.originalPrice && (
            <span className="text-sm text-text-light line-through">
              {formatPrice(bundle.originalPrice)}
            </span>
          )}
          <span className="text-xl font-semibold text-teal-deep">
            {formatPrice(bundle.price)}
          </span>
        </div>

        {/* Add to Cart button */}
        <AddToCartButton bundleId={bundle.id} />
      </div>
    </div>
  );
}
