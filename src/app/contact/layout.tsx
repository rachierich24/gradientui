import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Get in touch with the Gradient team. Whether you run a café, supply one, or build a brand, we’d love to talk.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact Gradient',
    description: 'Get in touch with the Gradient team.',
    url: 'https://www.gradient365.com/contact',
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
