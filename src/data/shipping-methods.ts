import type { ShippingMethod } from '@/types';

export const shippingMethods: ShippingMethod[] = [
  {
    id: 'standard',
    name: {
      hr: 'Standardna dostava',
      en: 'Standard Delivery',
    },
    carrier: 'Hrvatska Po\u0161ta',
    description: {
      hr: 'Dostava Hrvatskom Po\u0161tom na ku\u0107nu adresu u roku od 3-5 radnih dana.',
      en: 'Delivery by Hrvatska Po\u0161ta to your home address within 3-5 business days.',
    },
    price: 3.5,
    estimatedDays: '3-5',
    freeThreshold: 50,
  },
  {
    id: 'express',
    name: {
      hr: 'Ekspresna dostava',
      en: 'Express Delivery',
    },
    carrier: 'GLS / DPD',
    description: {
      hr: 'Brza dostava kurirskom slu\u017Ebom GLS ili DPD na ku\u0107nu adresu u roku od 1-2 radna dana.',
      en: 'Fast delivery by GLS or DPD courier service to your home address within 1-2 business days.',
    },
    price: 5.99,
    estimatedDays: '1-2',
  },
  {
    id: 'pickup',
    name: {
      hr: 'Preuzimanje na paketomatu',
      en: 'Parcel Locker Pickup',
    },
    carrier: 'BoxNow / GLS Parketomat',
    description: {
      hr: 'Preuzimanje paketa na najbli\u017Eem BoxNow ili GLS paketomatu u roku od 1-2 radna dana.',
      en: 'Pick up your package at the nearest BoxNow or GLS parcel locker within 1-2 business days.',
    },
    price: 2.5,
    estimatedDays: '1-2',
    freeThreshold: 50,
  },
];
