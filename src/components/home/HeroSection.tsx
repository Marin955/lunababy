'use client';

import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { RotateCcw, ShieldCheck, Truck, type LucideIcon } from 'lucide-react';
import Button from '@/components/ui/Button';
import { BUNDLES_SECTION_ID } from '@/lib/constants';

// Full-bleed photo (1446x1087): the baby sits left of centre, the box right of centre.
// The copy never covers the baby's face or the box.
const HERO_IMAGE = '/images/hero.jpg';

export default function HeroSection() {
  const t = useTranslations('home.hero');
  const tButtons = useTranslations('common.buttons');

  return (
    <section className="relative isolate overflow-hidden bg-warm-white flex items-end xl:items-center min-h-[calc(100svh-4rem)] max-h-[960px] sm:min-h-[calc(75vw+300px)] sm:max-h-none xl:min-h-0 xl:h-[clamp(640px,45vw,860px)]">
      {/* Phones: the photo covers the hero and the copy sits on a bottom scrim.
          Tablets: the photo spans the top at its own 4:3 size and the copy sits below it.
          From xl: the photo is anchored right at full height and fades into warm-white on the left. */}
      <div className="absolute inset-0 -z-10 sm:bottom-auto sm:aspect-[1446/1087] xl:bottom-0 xl:left-auto">
        <Image
          src={HERO_IMAGE}
          alt={t('imageAlt')}
          fill
          priority
          sizes="(min-width: 1280px) 60vw, 100vw"
          className="object-cover object-[40%_0%] xl:object-center"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-warm-white from-25% via-warm-white/80 via-45% to-transparent to-70% sm:hidden"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 hidden sm:block xl:hidden bg-gradient-to-t from-warm-white to-transparent to-30%"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 hidden xl:block bg-gradient-to-r from-warm-white via-warm-white/60 via-15% to-transparent to-35%"
          aria-hidden="true"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-8 sm:pb-12 xl:py-16 w-full">
        <div className="max-w-xl xl:max-w-lg">
          <h1 className="font-heading text-[2rem] sm:text-5xl lg:text-6xl font-semibold text-text-dark leading-[1.15] sm:leading-tight mb-3 sm:mb-5">
            {t('title')}
          </h1>

          <p className="text-base sm:text-xl text-text-dark/80 leading-relaxed mb-5 sm:mb-8">
            {t('subtitle')}
          </p>

          {/* CTAs: side by side from the smallest phones up, so products are reached sooner */}
          <div className="flex flex-wrap gap-3 sm:gap-4 mb-6 sm:mb-8">
            <Button
              type="button"
              className="flex-1 sm:flex-none px-3! sm:px-7! sm:min-h-12 sm:text-lg"
              onClick={() =>
                document.getElementById(BUNDLES_SECTION_ID)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
            >
              {t('cta')}
            </Button>
            <Button
              href="/about"
              variant="outline"
              className="flex-1 sm:flex-none px-3! sm:px-7! sm:min-h-12 sm:text-lg bg-white/80 backdrop-blur-sm"
            >
              {tButtons('learnMore')}
            </Button>
          </div>

          <ul className="flex flex-wrap gap-x-6 gap-y-2 sm:gap-y-3">
            <TrustBadge Icon={Truck} text={t('trustBadge1')} />
            <TrustBadge Icon={RotateCcw} text={t('trustBadge2')} />
            <TrustBadge Icon={ShieldCheck} text={t('trustBadge3')} />
          </ul>
        </div>
      </div>
    </section>
  );
}

function TrustBadge({ Icon, text }: { Icon: LucideIcon; text: string }) {
  return (
    <li className="flex items-center gap-2 text-sm text-text-dark/80">
      <span className="w-8 h-8 flex items-center justify-center rounded-full bg-white/80 text-teal-ink" aria-hidden="true">
        <Icon size={18} strokeWidth={1.5} />
      </span>
      <span className="font-semibold">{text}</span>
    </li>
  );
}
