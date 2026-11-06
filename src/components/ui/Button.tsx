'use client';

import React from 'react';
import { Link } from '@/i18n/navigation';

type ButtonVariant = 'primary' | 'secondary' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonBaseProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
};

type ButtonAsButton = ButtonBaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonBaseProps> & {
    href?: never;
  };

type ButtonAsLink = ButtonBaseProps &
  Omit<React.ComponentPropsWithoutRef<typeof Link>, keyof ButtonBaseProps> & {
    href: string;
  };

type ButtonProps = ButtonAsButton | ButtonAsLink;

// teal-ink keeps white button text and teal labels at >= 4.5:1 (see scripts/check-contrast.mjs).
const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-teal-ink text-white shadow-sm hover:bg-teal-ink-hover hover:shadow-md active:bg-teal-ink-hover',
  secondary:
    'bg-lavender-light text-text-dark hover:bg-lavender',
  outline:
    'border-2 border-teal-ink text-teal-ink bg-transparent hover:bg-teal-pale',
};

// Every size keeps a 44px minimum touch target.
const sizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-11 px-4 py-2 text-sm',
  md: 'min-h-11 px-6 py-2.5 text-base',
  lg: 'min-h-12 px-7 py-3 text-base sm:text-lg',
};

export default function Button(props: ButtonProps) {
  const {
    variant = 'primary',
    size = 'md',
    className = '',
    children,
    ...rest
  } = props;

  const baseClasses = [
    'inline-flex items-center justify-center gap-2 text-center leading-tight',
    'rounded-md font-body font-semibold',
    'transition-[background-color,box-shadow,transform,color] duration-200',
    'hover:-translate-y-0.5 motion-reduce:hover:translate-y-0',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-ink focus-visible:ring-offset-2 focus-visible:ring-offset-cream',
    'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none',
    'aria-disabled:pointer-events-none aria-disabled:opacity-50',
    'cursor-pointer',
    variantClasses[variant],
    sizeClasses[size],
    className,
  ].join(' ');

  if ('href' in props && props.href) {
    const { href, variant: _v, size: _s, className: _c, children: _ch, ...linkRest } = props as ButtonAsLink;
    return (
      <Link href={href} className={baseClasses} {...linkRest}>
        {children}
      </Link>
    );
  }

  const { variant: _v, size: _s, className: _c, children: _ch, href: _h, ...buttonRest } = props as ButtonAsButton;
  return (
    <button className={baseClasses} {...buttonRest}>
      {children}
    </button>
  );
}
