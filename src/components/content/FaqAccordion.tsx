'use client';

import React, { useState } from 'react';

type FaqItem = {
  question: string;
  answer: string;
};

type FaqAccordionProps = {
  items: FaqItem[];
};

export default function FaqAccordion({ items }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-0 divide-y divide-gray-200 border-t border-b border-gray-200">
      {items.map((item, index) => {
        const isOpen = openIndex === index;

        return (
          <div key={index}>
            <button
              type="button"
              onClick={() => toggle(index)}
              className="w-full flex items-center justify-between py-5 px-1 text-left cursor-pointer group"
              aria-expanded={isOpen}
            >
              <span className="font-heading text-base font-semibold text-text-dark pr-4 group-hover:text-teal-deep transition-colors duration-200">
                {item.question}
              </span>
              <span className="shrink-0 w-6 h-6 flex items-center justify-center text-teal-deep">
                <svg
                  className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </span>
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isOpen ? 'max-h-[500px] opacity-100 pb-5' : 'max-h-0 opacity-0'
              }`}
            >
              <p className="font-body text-text-mid leading-relaxed px-1">
                {item.answer}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
