'use client';

import React from 'react';

type InputBaseProps = {
  label?: string;
  error?: string;
  id?: string;
  className?: string;
};

type InputAsInput = InputBaseProps &
  Omit<React.InputHTMLAttributes<HTMLInputElement>, keyof InputBaseProps | 'type'> & {
    type?: Exclude<React.HTMLInputTypeAttribute, 'textarea'>;
  };

type InputAsTextarea = InputBaseProps &
  Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, keyof InputBaseProps | 'type'> & {
    type: 'textarea';
  };

type InputProps = InputAsInput | InputAsTextarea;

export default function Input(props: InputProps) {
  const { label, error, id, className = '', type, ...rest } = props;

  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  const fieldClasses = [
    'w-full px-4 py-3',
    'rounded-[--radius-sm]',
    'border border-gray-200 bg-white',
    'focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal',
    'transition-all',
    'font-body text-text-dark',
    'placeholder:text-text-light',
    error ? 'border-red-400 focus:ring-red-300/30 focus:border-red-400' : '',
    className,
  ].join(' ');

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-text-dark mb-1"
        >
          {label}
        </label>
      )}

      {type === 'textarea' ? (
        <textarea
          id={inputId}
          className={`${fieldClasses} min-h-[120px] resize-y`}
          {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          id={inputId}
          type={type || 'text'}
          className={fieldClasses}
          {...(rest as React.InputHTMLAttributes<HTMLInputElement>)}
        />
      )}

      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  );
}
