// Company / seller details shown in the footer, terms and contact pages (spec 005, P0).
// Every field is optional: components must render nothing for a null value.
// Never fill these with made-up data — the owner supplies the legal details.

export interface CompanyInfo {
  legalName: string | null;
  oib: string | null;
  address: string | null;
  register: string | null;
  representative: string | null;
  vatNote: string | null;
  email: string | null;
  phone: string | null;
  hours: { hr: string; en: string } | null;
  social: { instagram: string | null; facebook: string | null };
}

export const company: CompanyInfo = {
  legalName: null,
  oib: null,
  address: null,
  register: null,
  representative: null,
  vatNote: null,
  // Already published in the site copy (contact page, FAQ, returns).
  email: 'info@lunababy.eu',
  phone: '+385 95 7178 891',
  hours: null,
  social: { instagram: null, facebook: null },
};
