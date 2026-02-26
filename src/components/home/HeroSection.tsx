'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';

export default function HeroSection() {
  const t = useTranslations('home.hero');
  const tButtons = useTranslations('common.buttons');

  return (
    <section className="relative min-h-[80vh] flex items-center overflow-hidden" style={{ background: 'linear-gradient(165deg, var(--color-warm-white) 0%, var(--color-teal-pale) 35%, var(--color-lavender-pale) 65%, var(--color-gold-light) 100%)' }}>
      {/* Floating star decorations */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <span className="absolute top-[10%] left-[8%] text-2xl animate-twinkle opacity-60">&#10022;</span>
        <span className="absolute top-[20%] right-[12%] text-3xl animate-twinkle-delayed opacity-50">&#10022;</span>
        <span className="absolute top-[55%] left-[15%] text-xl animate-twinkle opacity-40">&#10022;</span>
        <span className="absolute top-[35%] right-[25%] text-lg animate-twinkle-delayed opacity-50">&#10022;</span>
        <span className="absolute bottom-[20%] left-[45%] text-2xl animate-twinkle opacity-30">&#10022;</span>
        <span className="absolute top-[70%] right-[8%] text-xl animate-twinkle-delayed opacity-40">&#10022;</span>
        <span className="absolute top-[15%] left-[55%] text-sm animate-twinkle opacity-50">&#10022;</span>
        <span className="absolute bottom-[30%] right-[40%] text-lg animate-twinkle opacity-35">&#10022;</span>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-20 w-full">
        <div className="max-w-2xl">
          {/* Badge */}
          <span className="inline-block px-4 py-1.5 bg-white/60 backdrop-blur-sm rounded-full text-sm font-semibold text-teal-deep mb-6">
            {t('badge')}
          </span>

          {/* Heading */}
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-semibold text-text-dark leading-tight mb-6">
            {t('title')}
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-text-mid leading-relaxed mb-8 max-w-xl">
            {t('subtitle')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 mb-10">
            <Button href="/shop" size="lg">
              {t('cta')}
            </Button>
            <Button href="/about" variant="outline" size="lg">
              {tButtons('learnMore')}
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap gap-6">
            <TrustBadge icon="truck" text={t('trustBadge1')} />
            <TrustBadge icon="return" text={t('trustBadge2')} />
            <TrustBadge icon="shield" text={t('trustBadge3')} />
          </div>
        </div>
      </div>

    </section>
  );
}

function TrustBadge({ icon, text }: { icon: 'truck' | 'return' | 'shield'; text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-text-mid">
      <span className="w-8 h-8 flex items-center justify-center rounded-full bg-white/60 text-teal-deep">
        {icon === 'truck' && (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
          </svg>
        )}
        {icon === 'return' && (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a5 5 0 015 5v2M3 10l4-4m-4 4l4 4" />
          </svg>
        )}
        {icon === 'shield' && (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        )}
      </span>
      <span className="font-medium">{text}</span>
    </div>
  );
}
