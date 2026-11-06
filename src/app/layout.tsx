import type { Metadata } from 'next';
import { Playfair_Display, Quicksand } from 'next/font/google';
import './globals.css';
import { SITE_URL } from '@/lib/site-metadata';

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-heading',
  display: 'swap',
});

const quicksand = Quicksand({
  subsets: ['latin'],
  // 500 is the body weight; 600/700 for UI emphasis. 300 was unused.
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

// Fallback only: every page renders under [locale]/layout.tsx, whose localized
// generateMetadata overrides title, description and social cards.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'LunaBaby — Nježni paketi za bebe',
  description: 'Pažljivo složeni paketi dječjih proizvoda za nove roditelje i poklone.',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hr" className={`${playfairDisplay.variable} ${quicksand.variable}`}>
      <body className="font-body bg-cream text-text-dark min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
