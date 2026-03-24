import { api } from './client';
import type { PromoValidation } from '@/types';

export async function validatePromoCode(
  code: string,
  cartTotal: number,
  locale: string = 'hr'
): Promise<PromoValidation> {
  const res = await api.post<{ data: PromoValidation }>('/promo_codes/validate', {
    code,
    cart_total: cartTotal,
    locale,
  });
  return res.data;
}
