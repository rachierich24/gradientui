import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Frequently asked questions about Gradient, the B2B café supply chain platform connecting cafés, suppliers, roasters, and brands.',
  alternates: { canonical: '/faq' },
}

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children
}
