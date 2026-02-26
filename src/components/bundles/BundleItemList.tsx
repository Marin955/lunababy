import React from 'react';
import type { BundleItem } from '@/types';

interface BundleItemListProps {
  items: BundleItem[];
  locale: string;
}

export default function BundleItemList({ items, locale }: BundleItemListProps) {
  const loc = locale as 'hr' | 'en';

  return (
    <ul className="space-y-4">
      {items.map((item, index) => (
        <li
          key={index}
          className="flex items-start gap-3 p-4 rounded-[--radius-sm] bg-cream hover:bg-teal-pale/30 transition-colors duration-200"
        >
          {/* Checkmark icon */}
          <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-teal-light text-teal-deep mt-0.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-text-dark text-sm">
                {item.name[loc]}
              </span>
              {item.quantity > 1 && (
                <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full bg-teal-light text-teal-deep">
                  x{item.quantity}
                </span>
              )}
            </div>
            <p className="text-sm text-text-mid leading-relaxed mt-1">
              {item.description[loc]}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
