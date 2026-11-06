'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import type { BundleItem } from '@/types';
import { buildSlides } from '@/components/bundles/product-page';

interface ProductCarouselProps {
  bundleImage: string | null;
  bundleName: string;
  items: BundleItem[];
  emoji: string;
  colorFrom: string;
  colorTo: string;
}

function getGradientClasses(colorFrom: string, colorTo: string): string {
  const fromMap: Record<string, string> = {
    'teal-light': 'from-teal-light',
    'teal-pale': 'from-teal-pale',
    'lavender-pale': 'from-lavender-pale',
    'gold-light': 'from-gold-light',
    'blush-light': 'from-blush-light',
    'sage-light': 'from-sage-light',
  };
  const toMap: Record<string, string> = {
    'teal-light': 'to-teal-light',
    'teal-pale': 'to-teal-pale',
    'lavender-light': 'to-lavender-light',
    'lavender-pale': 'to-lavender-pale',
    'gold-light': 'to-gold-light',
    'blush-light': 'to-blush-light',
    'sage-light': 'to-sage-light',
  };
  return `${fromMap[colorFrom] || 'from-teal-pale'} ${toMap[colorTo] || 'to-lavender-pale'}`;
}

function scrollBehavior(): ScrollBehavior {
  if (typeof window === 'undefined') return 'auto';
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
}

export default function ProductCarousel({
  bundleImage,
  bundleName,
  items,
  emoji,
  colorFrom,
  colorTo,
}: ProductCarouselProps) {
  const t = useTranslations('bundle.gallery');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const slides = buildSlides(bundleImage, bundleName, items);
  const totalSlides = slides.length;
  const hasMultiple = totalSlides > 1;

  const goTo = useCallback((index: number) => {
    const container = scrollRef.current;
    setCurrentIndex(index);
    if (!container) return;
    container.scrollTo({ left: container.offsetWidth * index, behavior: scrollBehavior() });
  }, []);

  function handlePrev() {
    goTo(currentIndex === 0 ? totalSlides - 1 : currentIndex - 1);
  }

  function handleNext() {
    goTo(currentIndex === totalSlides - 1 ? 0 : currentIndex + 1);
  }

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    function onScroll() {
      if (!container) return;
      setCurrentIndex(Math.round(container.scrollLeft / container.offsetWidth));
    }

    container.addEventListener('scroll', onScroll, { passive: true });
    return () => container.removeEventListener('scroll', onScroll);
  }, []);

  // No photos at all: decorative fallback (gradient + emoji).
  if (totalSlides === 0) {
    return (
      <div
        className={`aspect-square rounded-[--radius-xl] flex items-center justify-center bg-gradient-to-br ${getGradientClasses(colorFrom, colorTo)}`}
      >
        <span className="text-[120px] sm:text-[160px]" aria-hidden="true">{emoji}</span>
      </div>
    );
  }

  const arrowClasses =
    'absolute top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 backdrop-blur-sm shadow-md items-center justify-center text-text-dark hover:bg-white transition-colors cursor-pointer hidden sm:flex focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-deep';

  return (
    <div>
      <div className="relative rounded-[--radius-xl] overflow-hidden bg-white" aria-roledescription="carousel" aria-label={bundleName}>
        {/* Scrollable container: native swipe with scroll snapping on touch devices */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          {slides.map((slide, i) => (
            <div
              key={`${i}-${slide.src}`}
              className="flex-shrink-0 w-full snap-center"
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} / ${totalSlides}`}
            >
              <div className="relative aspect-square">
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  className={slide.type === 'bundle' ? 'object-cover' : 'object-contain p-6'}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority={i === 0}
                />
              </div>
            </div>
          ))}
        </div>

        {hasMultiple && (
          <>
            <button type="button" onClick={handlePrev} className={`${arrowClasses} left-3`} aria-label={t('previous')}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button type="button" onClick={handleNext} className={`${arrowClasses} right-3`} aria-label={t('next')}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Dots (mobile; thumbnails take over from sm up) */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex sm:hidden">
              {slides.map((slide, i) => (
                <button
                  key={`${i}-${slide.src}`}
                  type="button"
                  onClick={() => goTo(i)}
                  className="w-6 h-6 flex items-center justify-center cursor-pointer"
                  aria-label={t('goTo', { index: i + 1 })}
                  aria-current={i === currentIndex ? 'true' : undefined}
                >
                  <span
                    className={`block w-2.5 h-2.5 rounded-full shadow ${i === currentIndex ? 'bg-text-dark' : 'bg-white border border-gray-300'}`}
                  />
                </button>
              ))}
            </div>

            <div className="absolute bottom-3 right-3 bg-black/55 text-white text-[13px] font-semibold px-2.5 py-1 rounded-full" aria-hidden="true">
              {currentIndex + 1} / {totalSlides}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails (sm and up) */}
      {hasMultiple && (
        <ul className="hidden sm:flex flex-wrap gap-3 mt-4" aria-label={t('thumbnails')}>
          {slides.map((slide, i) => (
            <li key={`${i}-${slide.src}`}>
              <button
                type="button"
                onClick={() => goTo(i)}
                aria-label={slide.alt}
                aria-current={i === currentIndex ? 'true' : undefined}
                className={`relative block w-16 h-16 lg:w-[72px] lg:h-[72px] rounded-[--radius-sm] overflow-hidden bg-white border-2 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-deep ${
                  i === currentIndex ? 'border-text-dark' : 'border-transparent hover:border-gray-300'
                }`}
              >
                <Image
                  src={slide.src}
                  alt=""
                  fill
                  sizes="72px"
                  className={slide.type === 'bundle' ? 'object-cover' : 'object-contain p-1'}
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
