import type { Metadata } from 'next';
import './brand.css';
import './brand-dashboard.css';
import './brand-moat.css';
import './brand-transformation.css';
import './brand-features.css';
import './brand-bento.css';

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
  return <div className="brand-portal-root">{children}</div>;
}
