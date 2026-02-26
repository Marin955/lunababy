import React from 'react';

type BadgeType = 'new' | 'popular' | 'sale';

interface BadgeProps {
  type: BadgeType;
}

const badgeClasses: Record<BadgeType, string> = {
  new: 'bg-teal-light text-teal-deep',
  popular: 'bg-lavender-light text-[#8B7BA8]',
  sale: 'bg-[#FDDEDE] text-[#C27070]',
};

const badgeLabels: Record<BadgeType, string> = {
  new: 'New',
  popular: 'Popular',
  sale: 'Sale',
};

export default function Badge({ type }: BadgeProps) {
  return (
    <span
      className={`
        px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wide
        ${badgeClasses[type]}
      `}
    >
      {badgeLabels[type]}
    </span>
  );
}
