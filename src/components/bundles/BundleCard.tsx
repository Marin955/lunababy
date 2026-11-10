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

// Matches BundleGrid: 1 column < md, 2 columns md, 3 columns lg inside max-w-7xl.
const CARD_IMAGE_SIZES = '(min-width: 1280px) 400px, (min-width: 1024px) 31vw, (min-width: 768px) 46vw, 92vw';

// Fallback when a bundle has no box photo.
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
  const zoom = 'group-hover:scale-105 motion-reduce:group-hover:scale-100 transition-transform duration-300';

  return (
    <article className="group bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-hover hover:-translate-y-1 motion-reduce:hover:translate-y-0 transition-all duration-300 flex flex-col">
      {/* Top visual: box photo, else gradient + emoji */}
      <Link href={`/shop/${bundle.slug}`} className="block relative" tabIndex={-1} aria-hidden="true">
        <div
          className={`relative aspect-[4/3] overflow-hidden ${
            bundleImage
              ? 'bg-cream'
              : `bg-gradient-to-br ${getGradientClasses(bundle.color_from, bundle.color_to)} flex items-center justify-center`
          }`}
        >
          {bundleImage ? (
            <Image src={bundleImage} alt="" fill className={`object-cover ${zoom}`} sizes={CARD_IMAGE_SIZES} />
          ) : (
            <span className={`text-7xl ${zoom}`} aria-hidden="true">
              {bundle.emoji}
            </span>
          )}

          {bundle.badge && (
            <div className="absolute top-4 left-4">
              <Badge type={bundle.badge} />
            </div>
          )}

          {bundle.discount_percent > 0 && (
            <div className="absolute top-4 right-4 bg-sale text-white text-[13px] leading-tight font-bold px-2.5 py-1 rounded-full tabular-nums">
              -{bundle.discount_percent}%
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-col flex-1 p-5 sm:p-6">
        <h3 className="font-heading text-[22px] leading-snug font-semibold text-text-dark mb-1.5">
          <Link
            href={`/shop/${bundle.slug}`}
            className="hover:text-teal-ink focus-visible:outline-none focus-visible:underline transition-colors duration-200"
          >
            {bundle.name}
          </Link>
        </h3>

        <p className="text-[15px] text-text-mid leading-relaxed mb-4 flex-1">
          {bundle.short_description}
        </p>

        <div className="flex items-baseline gap-2 mb-4 tabular-nums">
          <span className="text-[22px] font-semibold text-teal-ink">
            {formatPrice(bundle.price, locale)}
          </span>
          {bundle.original_price && (
            <span className="text-sm text-text-light line-through">
              {formatPrice(bundle.original_price, locale)}
            </span>
          )}
        </div>

        <AddToCartButton bundleId={bundle.id} inStock={bundle.in_stock} />
      </div>
    </article>
  );
}
