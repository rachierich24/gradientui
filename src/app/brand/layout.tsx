import type { Metadata } from 'next';
import { Mona_Sans, Birthstone } from 'next/font/google';
import 'leaflet/dist/leaflet.css';
import './brand.css';
import './brand-dashboard.css';
import './brand-moat.css';
import './brand-transformation.css';
import './brand-features.css';
import './brand-bento.css';
import './brand-compare.css';
import './brand-close.css';

// the before-and-after sentence's face, cut wide and light in brand-compare.css
const mona = Mona_Sans({ subsets: ['latin'], axes: ['wdth'], variable: '--font-mona', display: 'swap' });
const birthstone = Birthstone({ weight: '400', subsets: ['latin'], variable: '--font-birthstone', display: 'swap' });

export const metadata: Metadata = {
  title: 'Gradient Brand Portal — Get your product into India’s best cafés',
  description:
    'Send trial kits to verified cafés through the suppliers they already buy from, hear what baristas think, and turn trials into weekly orders.',
  alternates: { canonical: '/brand' },
  openGraph: {
    title: 'Gradient Brand Portal — Get your product into India’s best cafés',
    description: 'Targeted café trials, barista feedback and real conversions, without sharing your data with competitors.',
    url: 'https://www.gradient365.com/brand',
    siteName: 'Gradient',
    locale: 'en_IN',
    type: 'website',
  },
};

export default function BrandLayout({ children }: { children: React.ReactNode }) {
  return <div className={`brand-portal-root ${mona.variable} ${birthstone.variable}`}>{children}</div>;
}
