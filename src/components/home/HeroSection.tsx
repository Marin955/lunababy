'use client';

import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { RotateCcw, ShieldCheck, Truck, type LucideIcon } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import Button from '@/components/ui/Button';
import LunaStar from '@/components/ui/LunaStar';
import { BUNDLES_SECTION_ID } from '@/lib/constants';
import { getBundleImage } from '@/lib/bundle-images';

const BEST_SELLER_SLUG = 'sleep-bundle';
const BEST_SELLER_HREF = `/shop/${BEST_SELLER_SLUG}`;
const BEST_SELLER_IMAGE = getBundleImage(BEST_SELLER_SLUG) ?? '/images/sleeping-box.jpg';
// Rendered width: max-w-md (448px) in the right column on desktop; on mobile
// the image is capped at 45vh tall, so it is at most ~min(100vw - 48px, 384px) wide.
const HERO_IMAGE_SIZES = '(min-width: 1024px) 448px, min(calc(100vw - 48px), 384px)';

export default function HeroSection() {
  const t = useTranslations('home.hero');
  const tButtons = useTranslations('common.buttons');

  return (
    <section
      className="relative lg:min-h-[80vh] flex items-center overflow-hidden"
      style={{ background: 'linear-gradient(165deg, var(--color-warm-white) 0%, var(--color-teal-pale) 35%, var(--color-lavender-pale) 65%, var(--color-gold-light) 100%)' }}
    >
      {/* Floating star decorations — logo-style stars, kept to the edges so they never sit behind text */}
      <div className="absolute inset-0 pointer-events-none text-[#E3C9A8]" aria-hidden="true">
        <LunaStar className="absolute top-[6%] right-[6%] w-5 h-5 animate-twinkle opacity-70" />
        <LunaStar className="absolute top-[3%] right-[28%] w-3 h-3 animate-twinkle-delayed opacity-60" />
        <LunaStar className="absolute bottom-[8%] left-[5%] w-4 h-4 animate-twinkle-delayed opacity-60" />
        <LunaStar className="hidden lg:block absolute top-[12%] left-[4%] w-4 h-4 animate-twinkle opacity-60" />
        <LunaStar className="hidden lg:block absolute bottom-[14%] left-[46%] w-3 h-3 animate-twinkle opacity-50" />
        <LunaStar className="hidden lg:block absolute bottom-[10%] right-[4%] w-5 h-5 animate-twinkle-delayed opacity-60" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 pt-6 pb-10 sm:py-14 lg:py-20 w-full">
        {/* One image element for both layouts: on mobile it sits between the copy and the
            CTAs; on desktop it moves to the right column spanning both rows. */}
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-rows-[auto_auto] gap-x-12 items-center">
          <div className="lg:self-end">
            <h1 className="font-heading text-[2rem] sm:text-5xl lg:text-6xl font-semibold text-text-dark leading-[1.15] sm:leading-tight mb-3 sm:mb-6">
              {t('title')}
            </h1>

            <p className="text-base sm:text-xl text-text-mid leading-relaxed mb-5 sm:mb-8 max-w-xl">
              {t('subtitle')}
            </p>
          </div>

          <div className="mb-6 lg:mb-0 lg:col-start-2 lg:row-start-1 lg:row-span-2 flex lg:justify-center">
            <Link
              href={BEST_SELLER_HREF}
              className="group relative block w-full max-w-sm lg:max-w-md rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-ink focus-visible:ring-offset-4"
            >
              <div className="hidden lg:block absolute -inset-4 bg-white/30 backdrop-blur-sm rounded-3xl rotate-3" aria-hidden="true" />
              <div className="relative rounded-2xl overflow-hidden shadow-lg lg:shadow-xl">
                <Image
                  src={BEST_SELLER_IMAGE}
                  alt={t('bestSellerAlt')}
                  width={1210}
                  height={864}
                  sizes={HERO_IMAGE_SIZES}
                  className="w-full h-auto max-h-[45vh] lg:max-h-none object-cover group-hover:scale-[1.03] motion-reduce:group-hover:scale-100 transition-transform duration-300"
                  priority
                />
              </div>
              <span className="absolute -bottom-3 right-3 lg:-right-3 bg-white/90 backdrop-blur-sm rounded-full px-4 py-1.5 lg:py-2 shadow-md text-sm font-semibold text-teal-ink group-hover:bg-white transition-colors">
                {t('bestSeller')}
              </span>
            </Link>
          </div>

          <div className="lg:self-start">
            {/* CTAs: side by side from the smallest phones up, so products are reached sooner */}
            <div className="flex flex-wrap gap-3 sm:gap-4 mb-6 sm:mb-10">
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
                className="flex-1 sm:flex-none px-3! sm:px-7! sm:min-h-12 sm:text-lg"
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
      </div>
    </section>
  );
}

function TrustBadge({ Icon, text }: { Icon: LucideIcon; text: string }) {
  return (
    <li className="flex items-center gap-2 text-sm text-text-mid">
      <span className="w-8 h-8 flex items-center justify-center rounded-full bg-white/70 text-teal-ink" aria-hidden="true">
        <Icon size={18} strokeWidth={1.5} />
      </span>
      <span className="font-semibold">{text}</span>
    </li>
  );
}
