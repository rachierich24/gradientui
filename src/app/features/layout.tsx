import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Features',
  description:
    'Everything cafés and suppliers need in one portal: catalogue, multi-supplier ordering, price negotiations, encrypted order chat, invoicing, and recurring pre-orders.',
  alternates: { canonical: '/features' },
  openGraph: {
    title: 'Gradient Features | One portal for café supply',
    description:
      'Catalogue, multi-supplier ordering, negotiations, invoicing, and pre-orders. One portal for café supply.',
    url: 'https://www.gradient365.com/features',
  },
}

export default function FeaturesLayout({ children }: { children: React.ReactNode }) {
  return children
}
