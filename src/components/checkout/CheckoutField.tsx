'use client';

import React from 'react';

type FieldProps = {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  multiline?: boolean;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'id'>;

/**
 * Checkout text field: label, input and an error that screen readers
 * announce with the field (aria-describedby). Errors are 14px.
 */
export default function CheckoutField({ id, label, error, hint, multiline, className = '', ...rest }: FieldProps) {
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(' ') || undefined;
  const fieldClasses = [
    'w-full px-4 py-3 rounded-[--radius-sm] border bg-white font-body text-base text-text-dark',
    'placeholder:text-text-mid transition-colors focus:outline-none focus:ring-2',
    error ? 'border-red-500 focus:ring-red-300/40' : 'border-gray-200 focus:border-teal focus:ring-teal/30',
    className,
  ].join(' ');

  return (
    <div className="w-full">
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-text-dark">
        {label}
        {rest.required && <span aria-hidden="true" className="text-red-600"> *</span>}
      </label>
      {multiline ? (
        <textarea
          id={id}
          className={`${fieldClasses} min-h-[110px] resize-y`}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          value={rest.value}
          onChange={rest.onChange as unknown as React.ChangeEventHandler<HTMLTextAreaElement>}
          placeholder={rest.placeholder}
          maxLength={rest.maxLength}
        />
      ) : (
        <input
          id={id}
          type="text"
          className={fieldClasses}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...rest}
        />
      )}
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-sm text-text-mid">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
