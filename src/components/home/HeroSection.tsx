'use client';

import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Button from '@/components/ui/Button';
import LunaStar from '@/components/ui/LunaStar';
import { BUNDLES_SECTION_ID } from '@/lib/constants';

const BEST_SELLER_HREF = '/shop/sleep-bundle';

export default function HeroSection() {
  const t = useTranslations('home.hero');
  const tButtons = useTranslations('common.buttons');

  return (
    <section className="relative min-h-[80vh] flex items-center overflow-hidden" style={{ background: 'linear-gradient(165deg, var(--color-warm-white) 0%, var(--color-teal-pale) 35%, var(--color-lavender-pale) 65%, var(--color-gold-light) 100%)' }}>
      {/* Floating star decorations — logo-style stars, kept to the edges so they never sit behind text */}
      <div className="absolute inset-0 pointer-events-none text-[#E3C9A8]" aria-hidden="true">
        <LunaStar className="absolute top-[6%] right-[6%] w-5 h-5 animate-twinkle opacity-70" />
        <LunaStar className="absolute top-[3%] right-[28%] w-3 h-3 animate-twinkle-delayed opacity-60" />
        <LunaStar className="absolute bottom-[8%] left-[5%] w-4 h-4 animate-twinkle-delayed opacity-60" />
        <LunaStar className="hidden lg:block absolute top-[12%] left-[4%] w-4 h-4 animate-twinkle opacity-60" />
        <LunaStar className="hidden lg:block absolute bottom-[14%] left-[46%] w-3 h-3 animate-twinkle opacity-50" />
        <LunaStar className="hidden lg:block absolute bottom-[10%] right-[4%] w-5 h-5 animate-twinkle-delayed opacity-60" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text content */}
          <div>

            {/* Heading */}
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-semibold text-text-dark leading-tight mb-6">
              {t('title')}
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-text-mid leading-relaxed mb-8 max-w-xl">
              {t('subtitle')}
            </p>

            {/* Featured package — mobile only (desktop shows it in the right column) */}
            <Link href={BEST_SELLER_HREF} className="lg:hidden block relative mb-8 max-w-sm">
              <div className="relative rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src="/images/sleeping-box.jpg"
                  alt={t('bestSellerAlt')}
                  width={600}
                  height={480}
                  className="w-full h-auto object-cover"
                  priority
                />
              </div>
              <span className="absolute -bottom-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-4 py-1.5 shadow-md text-sm font-semibold text-teal-deep">
                {t('bestSeller')}
              </span>
            </Link>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 mb-10">
              <Button
                type="button"
                size="lg"
                onClick={() =>
                  document.getElementById(BUNDLES_SECTION_ID)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
              >
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

          {/* Right: Featured product image */}
          <div className="hidden lg:flex justify-center">
            <Link href={BEST_SELLER_HREF} className="group relative w-full max-w-md">
              <div className="absolute -inset-4 bg-white/30 backdrop-blur-sm rounded-3xl rotate-3" />
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src="/images/sleeping-box.jpg"
                  alt={t('bestSellerAlt')}
                  width={600}
                  height={480}
                  className="w-full h-auto object-cover group-hover:scale-[1.03] transition-transform duration-300"
                  priority
                />
              </div>
              <div className="absolute -bottom-3 -right-3 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg group-hover:bg-white transition-colors">
                <span className="text-sm font-semibold text-teal-deep">{t('bestSeller')}</span>
              </div>
            </Link>
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
