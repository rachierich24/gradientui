import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Simple, transparent pricing for cafés, suppliers, and brands on Gradient. Find the plan that fits how you source and sell.',
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'Gradient Pricing',
    description: 'Simple, transparent pricing for cafés, suppliers, and brands on Gradient.',
    url: 'https://www.gradient365.com/pricing',
  },
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children
}
