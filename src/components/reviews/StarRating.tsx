import React from 'react';

interface StarRatingProps {
  /** 0–5, may be fractional (e.g. 4.5). */
  rating: number;
  /** Accessible text, e.g. "4.5 out of 5 stars". Omit when the value is shown as text next to it. */
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6' } as const;
const STAR_PATH =
  'M12 2.5l2.94 5.96 6.56.95-4.75 4.63 1.12 6.54L12 17.5l-5.87 3.08 1.12-6.54L2.5 9.41l6.56-.95L12 2.5z';

/** Read-only stars. Partial stars are drawn by clipping a filled star over an empty one. */
export default function StarRating({ rating, label, size = 'md', className = '' }: StarRatingProps) {
  const value = Math.max(0, Math.min(5, rating));

  return (
    <span
      className={`inline-flex items-center gap-0.5 ${className}`}
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
    >
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <span key={i} className={`relative inline-block ${SIZES[size]}`}>
            <svg viewBox="0 0 24 24" className="absolute inset-0 w-full h-full text-gray-300" aria-hidden="true">
              <path d={STAR_PATH} fill="currentColor" />
            </svg>
            {fill > 0 && (
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <svg viewBox="0 0 24 24" className={`${SIZES[size]} text-amber-600`} aria-hidden="true">
                  <path d={STAR_PATH} fill="currentColor" />
                </svg>
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}
