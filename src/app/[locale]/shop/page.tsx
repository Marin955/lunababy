import { redirect } from '@/i18n/navigation';
import { COLLECTION_HREF } from '@/lib/constants';

type Props = { params: Promise<{ locale: string }> };

// The full collection lives on the homepage; keep old /shop links working.
export default async function ShopPage({ params }: Props) {
  const { locale } = await params;
  redirect({ href: COLLECTION_HREF, locale });
}
