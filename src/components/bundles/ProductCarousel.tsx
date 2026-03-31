'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import type { BundleItem } from '@/types';

interface ProductCarouselProps {
  bundleImage: string | null;
  bundleName: string;
  items: BundleItem[];
  emoji: string;
  colorFrom: string;
  colorTo: string;
}

interface Slide {
  type: 'bundle' | 'product';
  src: string | null;
  alt: string;
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

export default function ProductCarousel({
  bundleImage,
  bundleName,
  items,
  emoji,
  colorFrom,
  colorTo,
}: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const slides: Slide[] = [
    { type: 'bundle', src: bundleImage, alt: bundleName },
    ...items
      .filter((item) => item.image_path)
      .map((item) => ({
        type: 'product' as const,
        src: item.image_path,
        alt: item.name,
      })),
  ];

  const totalSlides = slides.length;
  const hasMultiple = totalSlides > 1;

  const scrollToIndex = useCallback(
    (index: number) => {
      const container = scrollRef.current;
      if (!container) return;
      const slideWidth = container.offsetWidth;
      container.scrollTo({ left: slideWidth * index, behavior: 'smooth' });
    },
    []
  );

  function handlePrev() {
    const newIndex = currentIndex === 0 ? totalSlides - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
    scrollToIndex(newIndex);
  }

  function handleNext() {
    const newIndex = currentIndex === totalSlides - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
    scrollToIndex(newIndex);
  }

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    function onScroll() {
      if (!container) return;
      const slideWidth = container.offsetWidth;
      const index = Math.round(container.scrollLeft / slideWidth);
      setCurrentIndex(index);
    }

    container.addEventListener('scroll', onScroll, { passive: true });
    return () => container.removeEventListener('scroll', onScroll);
  }, []);

  const gradientClasses = getGradientClasses(colorFrom, colorTo);

  return (
    <div className="relative rounded-[--radius-xl] overflow-hidden">
      {/* Scrollable container */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        {slides.map((slide, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-full snap-center"
          >
            <div className={`relative min-h-[400px] lg:min-h-[500px] flex items-center justify-center ${
              slide.src ? 'bg-gray-50' : `bg-gradient-to-br ${gradientClasses}`
            }`}>
              {slide.src ? (
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority={i === 0}
                />
              ) : (
                <span className="text-[120px] sm:text-[160px]">{emoji}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Arrow buttons (desktop) */}
      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center text-text-dark hover:bg-white transition-colors cursor-pointer hidden sm:flex"
            aria-label="Previous image"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center text-text-dark hover:bg-white transition-colors cursor-pointer hidden sm:flex"
            aria-label="Next image"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dot indicators */}
      {hasMultiple && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setCurrentIndex(i);
                scrollToIndex(i);
              }}
              className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                i === currentIndex ? 'bg-white scale-110 shadow-md' : 'bg-white/50'
              }`}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Image label */}
      {hasMultiple && (
        <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full">
          {currentIndex + 1} / {totalSlides}
        </div>
      )}
    </div>
  );
}
