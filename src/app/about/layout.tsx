import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Gradient is building the digital infrastructure for India’s café and food economy, connecting brands, suppliers, and cafés in one network.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About Gradient',
    description:
      'Building the digital infrastructure for India’s café and food economy.',
    url: 'https://www.gradient365.com/about',
  },
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children
}
