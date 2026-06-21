import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Careers',
  description:
    'Join Gradient and help build the infrastructure India’s food economy runs on. See open roles across product, engineering, and operations.',
  alternates: { canonical: '/careers' },
  openGraph: {
    title: 'Careers at Gradient',
    description: 'Help build the infrastructure India’s food economy runs on.',
    url: 'https://www.gradient365.com/careers',
  },
}

export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return children
}
