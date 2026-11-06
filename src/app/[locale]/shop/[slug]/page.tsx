import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBundleBySlug } from '@/services/bundle-service';
import { formatPrice } from '@/lib/utils';
import { getBundleImage } from '@/lib/bundle-images';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import AddToCartButton from '@/components/bundles/AddToCartButton';
import BundleItemList from '@/components/bundles/BundleItemList';
import ProductCarousel from '@/components/bundles/ProductCarousel';
import StockStatus from '@/components/bundles/StockStatus';
import DeliveryEstimate from '@/components/bundles/DeliveryEstimate';
import RelatedBundles from '@/components/bundles/RelatedBundles';
import ReviewsSection from '@/components/reviews/ReviewsSection';
import { buildReviewJsonLd } from '@/components/reviews/review-json-ld';
import { getBundleReviews } from '@/services/api/reviews';
import {
  MAX_QUANTITY_PER_LINE,
  absoluteUrl,
  buildProductJsonLd,
  buildSlides,
  serializeJsonLd,
} from '@/components/bundles/product-page';
import { routing } from '@/i18n/routing';
import { COLLECTION_HREF } from '@/lib/constants';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ locale: string; slug: string }> };

// Trailing slash matches next.config `trailingSlash: true`.
const bundlePath = (locale: string, slug: string) => `/${locale}/shop/${slug}/`;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const bundle = await getBundleBySlug(slug, locale);
  const t = await getTranslations({ locale, namespace: 'metadata.bundle' });

  if (!bundle) {
    return { title: 'LunaBaby' };
  }

  const title = bundle.name + t('titleSuffix');
  const description = bundle.description || bundle.short_description;
  const [cover] = buildSlides(getBundleImage(bundle.slug), bundle.name, bundle.items);

  return {
    title,
    description,
    alternates: {
      canonical: absoluteUrl(bundlePath(locale, slug)),
      languages: Object.fromEntries(routing.locales.map((l) => [l, absoluteUrl(bundlePath(l, slug))])),
    },
    openGraph: {
      title,
      description,
      siteName: 'LunaBaby',
      locale: locale === 'hr' ? 'hr_HR' : 'en_US',
      type: 'website',
      url: absoluteUrl(bundlePath(locale, slug)),
      ...(cover && { images: [{ url: absoluteUrl(cover.src), alt: cover.alt }] }),
    },
    twitter: {
      card: cover ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(cover && { images: [absoluteUrl(cover.src)] }),
    },
  };
}

export default async function BundleDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const bundle = await getBundleBySlug(slug, locale);
  if (!bundle) {
    notFound();
  }

  const t = await getTranslations('bundle');
  const reviews = await getBundleReviews(slug, locale);
  const bundleImage = getBundleImage(bundle.slug);
  const maxQuantity = Math.max(1, Math.min(MAX_QUANTITY_PER_LINE, bundle.stock_quantity));
  const jsonLd = buildProductJsonLd(bundle, {
    url: bundlePath(locale, slug),
    images: buildSlides(bundleImage, bundle.name, bundle.items).map((s) => s.src),
    extra: buildReviewJsonLd(reviews),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />

      {/* Back to shop */}
      <div className="mb-6 sm:mb-8">
        <Button href={COLLECTION_HREF} variant="outline" size="sm">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          {t('backToShop')}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left: gallery */}
        <div className="relative min-w-0">
          <ProductCarousel
            bundleImage={bundleImage}
            bundleName={bundle.name}
            items={bundle.items}
            emoji={bundle.emoji}
            colorFrom={bundle.color_from}
            colorTo={bundle.color_to}
          />

          {bundle.badge && (
            <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10">
              <Badge type={bundle.badge} />
            </div>
          )}

          {bundle.discount_percent > 0 && (
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 bg-red-600 text-white text-sm font-bold px-3 py-1.5 rounded-full">
              -{bundle.discount_percent}%
            </div>
          )}
        </div>

        {/* Right: details + buy box */}
        <div className="flex flex-col min-w-0">
          <h1 className="font-heading text-3xl sm:text-4xl font-semibold text-text-dark mb-4">
            {bundle.name}
          </h1>

          <p className="text-text-mid leading-relaxed mb-6">
            {bundle.description}
          </p>

          {/* Buy box: price → lowest 30-day price → stock → quantity → add to cart → delivery */}
          <div className="flex flex-col gap-5 mb-10">
            <div>
              <div className="flex items-end gap-4">
                {bundle.original_price && (
                  <div className="flex flex-col">
                    <span className="text-[13px] text-text-mid uppercase tracking-wide">
                      {t('originalPrice')}
                    </span>
                    <span className="text-lg text-text-mid line-through tabular-nums">
                      {formatPrice(bundle.original_price, locale)}
                    </span>
                  </div>
                )}
                <div className="flex flex-col">
                  {bundle.original_price && (
                    <span className="text-[13px] text-teal-ink uppercase tracking-wide font-semibold">
                      {t('salePrice')}
                    </span>
                  )}
                  <span className="text-3xl font-semibold text-teal-ink tabular-nums">
                    {formatPrice(bundle.price, locale)}
                  </span>
                </div>
              </div>

              {/* Required by Croatian consumer protection law */}
              {bundle.lowest_price_30_days != null && (
                <p className="mt-2 text-[13px] text-text-mid">
                  {t('lowestPrice30Days', { price: formatPrice(bundle.lowest_price_30_days, locale) })}
                </p>
              )}
            </div>

            <StockStatus inStock={bundle.in_stock} stockQuantity={bundle.stock_quantity} />

            <AddToCartButton bundleId={bundle.id} inStock={bundle.in_stock} maxQuantity={maxQuantity} />

            {bundle.in_stock && <DeliveryEstimate locale={locale} />}
          </div>

          {/* What's included */}
          <div>
            <h2 className="font-heading text-xl font-semibold text-text-dark mb-4">
              {t('whatsIncluded')}
            </h2>
            <BundleItemList items={bundle.items} />
          </div>
        </div>
      </div>

      {/* Verified-purchase reviews; renders nothing until there is an approved review. */}
      <ReviewsSection slug={bundle.slug} locale={locale} reviews={reviews} />

      <RelatedBundles currentBundleId={bundle.id} locale={locale} />
    </div>
  );
}
