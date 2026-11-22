import type { Metadata } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import './cafe.css';
import './cafe-bento.css';
import './cafe-stories.css';
import './cafe-cta.css';

// the hero's display face: a heavy, soft serif (Fraunces at full weight with its SOFT and WONK axes)
const fraunces = Fraunces({ subsets: ['latin'], axes: ['SOFT', 'WONK', 'opsz'], variable: '--font-cafe-display', display: 'swap' });
const inter = Inter({ subsets: ['latin'], variable: '--font-cafe-sans', display: 'swap' });

export const metadata: Metadata = {
  title: 'Gradient Café Portal — Order from every supplier, in one tap',
  description:
    'One cart for every supplier your café buys from. Compare prices, schedule restocks, track deliveries and keep GST-ready bills, all in the Gradient café portal.',
  alternates: { canonical: '/cafe' },
  openGraph: {
    title: 'Gradient Café Portal — Order from every supplier, in one tap',
    description: 'One cart for every supplier, scheduled restocks, live delivery tracking and bills that reconcile themselves.',
    url: 'https://www.gradient365.com/cafe',
    siteName: 'Gradient',
    locale: 'en_IN',
    type: 'website',
  },
};

export default function CafeLayout({ children }: { children: React.ReactNode }) {
  return <div className={`cafe-portal-root ${fraunces.variable} ${inter.variable}`}>{children}</div>;
}
