import type { Metadata } from 'next';
import './supplier.css';
import './supplier-flow.css';

export const metadata: Metadata = {
  title: 'Gradient Supplier Portal — Every Café Order. Ready to Fulfill.',
  description:
    'Receive wholesale orders, manage inventory and move every delivery forward — all from one supplier workspace. Built for the people who keep cafés running.',
  keywords: [
    'Gradient supplier portal',
    'B2B coffee supplier platform',
    'café wholesale supply India',
    'coffee roaster distribution software',
    'automated wholesale orders',
    'HoReCa procurement platform',
    'Gradient',
  ],
  alternates: {
    canonical: '/supplier',
  },
  openGraph: {
    title: 'Gradient Supplier Portal — Every Café Order. Ready to Fulfill.',
    description:
      'Receive wholesale orders, manage inventory and move every delivery forward — all from one supplier workspace.',
    url: 'https://www.gradient365.com/supplier',
    siteName: 'Gradient',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Grabbit Supplier Portal — Every Café Order. Ready to Fulfill.',
    description:
      'Receive wholesale orders, manage inventory and move every delivery forward — all from one supplier workspace.',
  },
};

export default function SupplierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="supplier-portal-root">{children}</div>;
}
