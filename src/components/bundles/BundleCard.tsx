'use client';

import React from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import type { Bundle } from '@/types';
import { formatPrice } from '@/lib/utils';
import { getBundleImage } from '@/lib/bundle-images';
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
  const bundleImage = getBundleImage(bundle.slug);

  return (
    <div className="group bg-white rounded-[--radius-lg] shadow-sm overflow-hidden hover:shadow-hover hover:-translate-y-1 transition-all duration-300 flex flex-col">
      {/* Top visual: product image or gradient+emoji */}
      <Link href={`/shop/${bundle.slug}`} className="block relative">
        <div
          className={`relative h-48 ${bundleImage ? '' : `bg-gradient-to-br ${getGradientClasses(bundle.color_from, bundle.color_to)}`} flex items-center justify-center overflow-hidden`}
        >
          {bundleImage ? (
            <Image
              src={bundleImage}
              alt={bundle.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <span className="text-7xl group-hover:scale-110 transition-transform duration-300">
              {bundle.emoji}
            </span>
          )}

          {/* Badge overlay */}
          {bundle.badge && (
            <div className="absolute top-4 left-4">
              <Badge type={bundle.badge} />
            </div>
          )}

          {/* Discount badge */}
          {bundle.discount_percent > 0 && (
            <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              -{bundle.discount_percent}%
            </div>
          )}
        </div>
      </Link>

      {/* Card body */}
      <div className="flex flex-col flex-1 p-5">
        <Link href={`/shop/${bundle.slug}`}>
          <h3 className="font-heading text-lg font-semibold text-text-dark mb-1 group-hover:text-teal-deep transition-colors duration-200">
            {bundle.name}
          </h3>
        </Link>

        <p className="text-sm text-text-mid leading-relaxed mb-4 flex-1">
          {bundle.short_description}
        </p>

        {/* Price */}
        <div className="flex items-center gap-2 mb-4">
          {bundle.original_price && (
            <span className="text-sm text-text-light line-through">
              {formatPrice(bundle.original_price, locale)}
            </span>
          )}
          <span className="text-xl font-semibold text-teal-deep">
            {formatPrice(bundle.price, locale)}
          </span>
        </div>

        {/* Add to Cart button */}
        <AddToCartButton bundleId={bundle.id} inStock={bundle.in_stock} />
      </div>
    </div>
  );
}
