import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBundleBySlug } from '@/services/bundle-service';

export const dynamic = 'force-dynamic';
import { formatPrice } from '@/lib/utils';
import { getBundleImage } from '@/lib/bundle-images';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import AddToCartButton from '@/components/bundles/AddToCartButton';
import BundleItemList from '@/components/bundles/BundleItemList';
import ProductCarousel from '@/components/bundles/ProductCarousel';

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const bundle = await getBundleBySlug(slug, locale);
  const t = await getTranslations({ locale, namespace: 'metadata.bundle' });

  if (!bundle) {
    return { title: 'LunaBaby' };
  }

  const title = bundle.name + t('titleSuffix');
  const description = bundle.description;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: 'LunaBaby',
      locale: locale === 'hr' ? 'hr_HR' : 'en_US',
      type: 'website',
    },
  };
}

export default async function BundleDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const bundle = await getBundleBySlug(slug, locale);
  if (!bundle) {
    notFound();
  }

  const t = await getTranslations('bundle');

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Back to shop */}
      <div className="mb-8">
        <Button href="/shop" variant="outline" size="sm">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          {t('backToShop')}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Image carousel */}
        <div className="relative">
          <ProductCarousel
            bundleImage={getBundleImage(bundle.slug)}
            bundleName={bundle.name}
            items={bundle.items}
            emoji={bundle.emoji}
            colorFrom={bundle.color_from}
            colorTo={bundle.color_to}
          />

          {bundle.badge && (
            <div className="absolute top-6 left-6 z-10">
              <Badge type={bundle.badge} />
            </div>
          )}

          {bundle.discount_percent > 0 && (
            <div className="absolute top-6 right-6 z-20 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-full">
              -{bundle.discount_percent}%
            </div>
          )}
        </div>

        {/* Right: Details */}
        <div className="flex flex-col">
          {/* Bundle name */}
          <h1 className="font-heading text-3xl sm:text-4xl font-semibold text-text-dark mb-4">
            {bundle.name}
          </h1>

          {/* Description */}
          <p className="text-text-mid leading-relaxed mb-8">
            {bundle.description}
          </p>

          {/* Price section */}
          <div className="flex items-center gap-4 mb-8">
            {bundle.original_price && (
              <div className="flex flex-col">
                <span className="text-xs text-text-light uppercase tracking-wide">
                  {t('originalPrice')}
                </span>
                <span className="text-lg text-text-light line-through">
                  {formatPrice(bundle.original_price, locale)}
                </span>
              </div>
            )}
            <div className="flex flex-col">
              {bundle.original_price && (
                <span className="text-xs text-teal-deep uppercase tracking-wide font-semibold">
                  {t('salePrice')}
                </span>
              )}
              <span className="text-3xl font-semibold text-teal-deep">
                {formatPrice(bundle.price, locale)}
              </span>
            </div>
          </div>

          {/* Add to Cart */}
          <div className="mb-10">
            <AddToCartButton bundleId={bundle.id} inStock={bundle.in_stock} />
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
    </div>
  );
}
