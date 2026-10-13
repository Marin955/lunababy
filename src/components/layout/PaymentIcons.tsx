import React from 'react';

// Payment methods Stripe supports for a Croatian account: card networks plus Apple Pay and Google Pay.
// Each icon is drawn on a 38x24 card-shaped canvas so the row reads as a consistent set.

function Card({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 38 24" className="h-6 w-auto" role="img" aria-label={label}>
      <title>{label}</title>
      <rect x="0.5" y="0.5" width="37" height="23" rx="3.5" fill="#fff" stroke="#E5E7EB" />
      {children}
    </svg>
  );
}

function Visa() {
  return (
    <Card label="Visa">
      <text x="19" y="16" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize="10.5" fontWeight="900" fontStyle="italic" fill="#1A1F71" letterSpacing="0.3">
        VISA
      </text>
    </Card>
  );
}

function Mastercard() {
  return (
    <Card label="Mastercard">
      <circle cx="15" cy="12" r="6.5" fill="#EB001B" />
      <circle cx="23" cy="12" r="6.5" fill="#F79E1B" />
      <path d="M19 6.88a6.5 6.5 0 0 1 0 10.24 6.5 6.5 0 0 1 0-10.24z" fill="#FF5F00" />
    </Card>
  );
}

function Maestro() {
  return (
    <Card label="Maestro">
      <circle cx="15" cy="12" r="6.5" fill="#EB001B" />
      <circle cx="23" cy="12" r="6.5" fill="#00A2E5" />
      <path d="M19 6.88a6.5 6.5 0 0 1 0 10.24 6.5 6.5 0 0 1 0-10.24z" fill="#7375CF" />
    </Card>
  );
}

function Amex() {
  return (
    <svg viewBox="0 0 38 24" className="h-6 w-auto" role="img" aria-label="American Express">
      <title>American Express</title>
      <rect width="38" height="24" rx="4" fill="#2E77BC" />
      <text x="19" y="15.5" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize="8" fontWeight="900" fill="#fff" letterSpacing="0.4">
        AMEX
      </text>
    </svg>
  );
}

function ApplePay() {
  return (
    <Card label="Apple Pay">
      <g transform="translate(6.5 6) scale(0.5)" fill="#000">
        <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
      </g>
      <text x="25" y="15.6" textAnchor="middle" fontFamily="-apple-system, Helvetica, Arial, sans-serif" fontSize="8.5" fontWeight="600" fill="#000">
        Pay
      </text>
    </Card>
  );
}

function GooglePay() {
  return (
    <Card label="Google Pay">
      <g transform="translate(5.5 7) scale(0.42)" fill="#5F6368">
        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
      </g>
      <text x="24.5" y="15.6" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize="8.5" fontWeight="600" fill="#5F6368">
        Pay
      </text>
    </Card>
  );
}

export default function PaymentIcons() {
  return (
    <div className="flex items-center gap-2 flex-wrap justify-center">
      <Visa />
      <Mastercard />
      <Maestro />
      <Amex />
      <ApplePay />
      <GooglePay />
    </div>
  );
}
