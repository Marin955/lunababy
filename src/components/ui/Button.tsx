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

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-teal-deep text-white hover:bg-teal shadow-md hover:shadow-hover',
  secondary:
    'bg-lavender-light text-text-dark hover:bg-lavender',
  outline:
    'border-2 border-teal text-teal-deep hover:bg-teal-pale',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
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
    'inline-flex items-center justify-center',
    'rounded-[--radius-md] font-body font-semibold',
    'transition-all duration-300',
    'hover:-translate-y-0.5',
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
