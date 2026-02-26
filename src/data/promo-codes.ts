import type { PromoCode } from '@/types';

export const promoCodes: PromoCode[] = [
  {
    code: 'LUNA10',
    type: 'percentage',
    value: 10,
    label: {
      hr: '10% popusta',
      en: '10% off',
    },
  },
  {
    code: 'BEBA20',
    type: 'fixed',
    value: 20,
    minOrderAmount: 50,
    label: {
      hr: '\u20AC20 popusta na narud\u017Ebe iznad \u20AC50',
      en: '\u20AC20 off orders over \u20AC50',
    },
  },
  {
    code: 'FREESHIP',
    type: 'free-shipping',
    value: 0,
    label: {
      hr: 'Besplatna dostava',
      en: 'Free shipping',
    },
  },
];
