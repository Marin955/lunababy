import type { Metadata } from 'next';
import { Playfair_Display, Quicksand } from 'next/font/google';
import './globals.css';

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-heading',
  display: 'swap',
});

const quicksand = Quicksand({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'LunaBaby — Nježna njega za vašeg malog mjesečevog zraka',
  description:
    'Pažljivo odabrani dječji proizvodi za moderne roditelje. Organski, sigurni i lijepo dizajnirani.',
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
