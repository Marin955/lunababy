'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { getBundleThumbnail } from '@/lib/bundle-images';
import type { Bundle } from '@/types';

interface BundleThumbProps {
  bundle: Bundle;
  /** Rendered square size in CSS px (64–80 in the cart). */
  size?: number;
  className?: string;
}

/**
 * Square bundle photo for cart lines and the mini-cart.
 * Uses the box photo from `lib/bundle-images`, keyed by slug, rather than the
 * API's `image_path`, so the frontend controls which files exist.
 * Falls back to the gradient + emoji tile when there is no image or it fails.
 */
export default function BundleThumb({ bundle, size = 72, className = '' }: BundleThumbProps) {
  const image = getBundleThumbnail(bundle.slug);
  const [failed, setFailed] = useState(false);
  const src = image && !failed ? image : null;

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-[--radius-md] bg-gradient-to-br from-teal-pale to-lavender-pale flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {src ? (
        <Image
          src={src}
          alt=""
          fill
          sizes={`${size}px`}
          className="object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="text-2xl" aria-hidden="true">
          {bundle.emoji}
        </span>
      )}
    </div>
  );
}
