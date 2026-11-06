'use client';

import React, { useId, useState } from 'react';

interface StarInputProps {
  value: number;
  onChange: (value: number) => void;
  legend: string;
  /** Accessible name per value, index 0 = 1 star. */
  optionLabels: string[];
  invalid?: boolean;
  describedBy?: string;
}

const STAR_PATH =
  'M12 2.5l2.94 5.96 6.56.95-4.75 4.63 1.12 6.54L12 17.5l-5.87 3.08 1.12-6.54L2.5 9.41l6.56-.95L12 2.5z';

/**
 * 1–5 star picker built on native radio buttons, so the keyboard works the
 * usual way: Tab into the group, arrow keys change the rating.
 */
export default function StarInput({ value, onChange, legend, optionLabels, invalid, describedBy }: StarInputProps) {
  const name = useId();
  const [hover, setHover] = useState(0);
  const shown = hover || value;

  return (
    <fieldset aria-invalid={invalid || undefined} aria-describedby={describedBy}>
      <legend className="block text-sm font-semibold text-text-dark mb-2">{legend}</legend>
      <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((star) => {
          const id = `${name}-${star}`;
          return (
            <span key={star} className="relative">
              <input
                id={id}
                type="radio"
                name={name}
                value={star}
                checked={value === star}
                onChange={() => onChange(star)}
                className="peer sr-only"
              />
              <label
                htmlFor={id}
                onMouseEnter={() => setHover(star)}
                className="flex items-center justify-center w-11 h-11 rounded-full cursor-pointer peer-focus-visible:ring-2 peer-focus-visible:ring-teal-deep peer-focus-visible:ring-offset-2"
              >
                <span className="sr-only">{optionLabels[star - 1]}</span>
                <svg
                  viewBox="0 0 24 24"
                  className={`w-9 h-9 transition-colors ${star <= shown ? 'text-amber-600' : 'text-gray-300'}`}
                  aria-hidden="true"
                >
                  <path d={STAR_PATH} fill="currentColor" stroke={star <= shown ? 'none' : '#9ca3af'} strokeWidth="0.75" />
                </svg>
              </label>
            </span>
          );
        })}
        {shown > 0 && (
          <span className="ml-2 text-sm text-text-mid" aria-hidden="true">
            {optionLabels[shown - 1]}
          </span>
        )}
      </div>
    </fieldset>
  );
}
