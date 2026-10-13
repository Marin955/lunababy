import React from 'react';
import { useTranslations } from 'next-intl';

type BadgeType = 'new' | 'popular' | 'sale';

interface BadgeProps {
  type: BadgeType;
}

const badgeClasses: Record<BadgeType, string> = {
  new: 'bg-teal-light text-teal-deep',
  popular: 'bg-lavender-light text-[#8B7BA8]',
  sale: 'bg-[#FDDEDE] text-[#C27070]',
};

export default function Badge({ type }: BadgeProps) {
  const t = useTranslations('bundle.badges');

  return (
    <span
      className={`
        px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wide
        ${badgeClasses[type]}
      `}
    >
      {t(type)}
    </span>
  );
}
