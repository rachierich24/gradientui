import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Team',
  description: 'The people building Gradient, the operating system for India’s café supply chain.',
  alternates: { canonical: '/team' },
  openGraph: {
    title: 'Team | Gradient',
    description: 'The people building Gradient, the operating system for India’s café supply chain.',
    url: 'https://www.gradient365.com/team',
  },
}

export default function TeamLayout({ children }: { children: React.ReactNode }) {
  return children
}
