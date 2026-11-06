import React from 'react';
import { useTranslations } from 'next-intl';

type BadgeType = 'new' | 'popular' | 'sale';

interface BadgeProps {
  type: BadgeType;
}

const badgeClasses: Record<BadgeType, string> = {
  new: 'bg-teal-light text-teal-ink',
  popular: 'bg-lavender-light text-lavender-ink',
  sale: 'bg-sale-light text-sale',
};

export default function Badge({ type }: BadgeProps) {
  const t = useTranslations('bundle.badges');

  return (
    <span
      className={`
        inline-block px-3 py-1 text-[13px] leading-tight font-bold rounded-full uppercase tracking-wide
        ${badgeClasses[type]}
      `}
    >
      {t(type)}
    </span>
  );
}
