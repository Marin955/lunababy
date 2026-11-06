import React from 'react';

// Payment methods offered through Stripe Checkout: card networks, Apple Pay, Google Pay, Revolut Pay and PayPal.
// Each mark is drawn on a 38x24 card-shaped canvas and rendered as an <img> with alt text. Rendering the SVG
// inline exposed its <text> nodes ("Pay", "Pay") to page text and some screen readers, which read as "Pay Pay".

const FRAME = '<rect x="0.5" y="0.5" width="37" height="23" rx="3.5" fill="#fff" stroke="#E5E7EB"/>';
const SANS = 'Arial, Helvetica, sans-serif';

const APPLE_LOGO =
  'M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701';

const GOOGLE_G =
  'M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z';

const MARKS: { name: string; svg: string }[] = [
  {
    name: 'Visa',
    svg: `${FRAME}<text x="19" y="16" text-anchor="middle" font-family="${SANS}" font-size="10.5" font-weight="900" font-style="italic" fill="#1A1F71" letter-spacing="0.3">VISA</text>`,
  },
  {
    name: 'Mastercard',
    svg: `${FRAME}<circle cx="15" cy="12" r="6.5" fill="#EB001B"/><circle cx="23" cy="12" r="6.5" fill="#F79E1B"/><path d="M19 6.88a6.5 6.5 0 0 1 0 10.24 6.5 6.5 0 0 1 0-10.24z" fill="#FF5F00"/>`,
  },
  {
    name: 'Maestro',
    svg: `${FRAME}<circle cx="15" cy="12" r="6.5" fill="#EB001B"/><circle cx="23" cy="12" r="6.5" fill="#00A2E5"/><path d="M19 6.88a6.5 6.5 0 0 1 0 10.24 6.5 6.5 0 0 1 0-10.24z" fill="#7375CF"/>`,
  },
  {
    name: 'American Express',
    svg: `<rect width="38" height="24" rx="4" fill="#2E77BC"/><text x="19" y="15.5" text-anchor="middle" font-family="${SANS}" font-size="8" font-weight="900" fill="#fff" letter-spacing="0.4">AMEX</text>`,
  },
  {
    name: 'Apple Pay',
    svg: `${FRAME}<g transform="translate(6.5 6) scale(0.5)" fill="#000"><path d="${APPLE_LOGO}"/></g><text x="25" y="15.6" text-anchor="middle" font-family="-apple-system, Helvetica, Arial, sans-serif" font-size="8.5" font-weight="600" fill="#000">Pay</text>`,
  },
  {
    name: 'Google Pay',
    svg: `${FRAME}<g transform="translate(5.5 7) scale(0.42)" fill="#5F6368"><path d="${GOOGLE_G}"/></g><text x="24.5" y="15.6" text-anchor="middle" font-family="${SANS}" font-size="8.5" font-weight="600" fill="#5F6368">Pay</text>`,
  },
  {
    name: 'Revolut Pay',
    svg: `<rect width="38" height="24" rx="4" fill="#191C1F"/><text x="19" y="11" text-anchor="middle" font-family="${SANS}" font-size="7" font-weight="700" fill="#fff">Revolut</text><text x="19" y="19" text-anchor="middle" font-family="${SANS}" font-size="6.5" font-weight="600" fill="#fff">Pay</text>`,
  },
  {
    name: 'PayPal',
    svg: `${FRAME}<text x="19" y="15.5" text-anchor="middle" font-family="Verdana, ${SANS}" font-size="8.5" font-weight="700" font-style="italic"><tspan fill="#003087">Pay</tspan><tspan fill="#009CDE">Pal</tspan></text>`,
  },
];

function toDataUri(body: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 38 24" width="38" height="24">${body}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export default function PaymentIcons({ label }: { label: string }) {
  return (
    <ul aria-label={label} className="flex items-center gap-2 flex-wrap justify-center">
      {MARKS.map(({ name, svg }) => (
        <li key={name}>
          {/* eslint-disable-next-line @next/next/no-img-element -- tiny inline SVG data URI, nothing to optimise */}
          <img src={toDataUri(svg)} alt={name} title={name} width={38} height={24} className="h-6 w-auto" />
        </li>
      ))}
    </ul>
  );
}
