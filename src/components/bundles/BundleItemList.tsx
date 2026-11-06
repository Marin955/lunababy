import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import type { BundleItem } from '@/types';
import ProductSpecs, { hasSpecs } from '@/components/bundles/ProductSpecs';

interface BundleItemListProps {
  items: BundleItem[];
}

/** Certifications every item in the bundle has (empty when any item has none). */
export function sharedCertifications(items: BundleItem[]): string[] {
  if (items.length === 0) return [];
  const [first, ...rest] = items.map((item) => item.certifications ?? []);
  return first.filter((cert) => rest.every((certs) => certs.includes(cert)));
}

function ItemHeading({ item }: { item: BundleItem }) {
  return (
    <span className="flex items-center gap-3 min-w-0">
      {item.image_path ? (
        <Image
          src={item.image_path}
          alt=""
          width={48}
          height={48}
          className="w-12 h-12 flex-shrink-0 rounded-[--radius-sm] object-cover bg-white"
        />
      ) : (
        <span aria-hidden="true" className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-[--radius-sm] bg-teal-light text-text-dark">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </span>
      )}
      <span className="font-semibold text-text-dark text-[15px] leading-snug">{item.name}</span>
      {item.quantity > 1 && (
        <span className="flex-shrink-0 inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full bg-teal-light text-text-dark">
          ×{item.quantity}
        </span>
      )}
    </span>
  );
}

export default function BundleItemList({ items }: BundleItemListProps) {
  const t = useTranslations('bundle.specs');
  const certified = sharedCertifications(items);

  return (
    <div>
      {certified.length > 0 && (
        <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-green-800">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          {t('allCertified', { list: certified.join(', ') })}
        </p>
      )}

      <ul className="space-y-3">
        {items.map((item) => {
          const expandable = Boolean(item.description) || hasSpecs(item);

          return (
            <li key={item.id} className="rounded-[--radius-sm] bg-cream">
              {expandable ? (
                <details className="group">
                  <summary
                    className="flex items-center justify-between gap-3 min-h-[44px] px-4 py-3 cursor-pointer list-none [&::-webkit-details-marker]:hidden rounded-[--radius-sm] hover:bg-teal-pale/40 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-deep"
                  >
                    <ItemHeading item={item} />
                    <svg
                      className="w-5 h-5 flex-shrink-0 text-text-mid transition-transform group-open:rotate-180"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-4 pb-4 pt-1 space-y-4">
                    {item.description && (
                      <p className="text-sm text-text-mid leading-relaxed">{item.description}</p>
                    )}
                    <ProductSpecs item={item} />
                  </div>
                </details>
              ) : (
                <div className="flex items-center min-h-[44px] px-4 py-3">
                  <ItemHeading item={item} />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
