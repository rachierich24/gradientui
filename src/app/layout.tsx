import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import 'lenis/dist/lenis.css'
import './landing-fonts.css'
import './landing.css'
import { LenisProvider } from '@/components/LenisProvider'
import { CookieConsent } from '@/components/CookieConsent'
import { SupportWidget } from '@/components/SupportWidget'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://www.gradient365.com'),
  title: {
    default: 'Gradient | One portal for café supply',
    template: '%s | Gradient',
  },
  description:
    'Gradient connects independent cafés with the suppliers, roasters, and brands they buy from and gives both sides one place to source, order, fulfil, invoice, and grow.',
  keywords: [
    'café supply chain',
    'B2B coffee marketplace',
    'HoReCa procurement',
    'supplier ordering platform',
    'India café suppliers',
    'restaurant supply chain',
    'Gradient 365',
  ],
  authors: [{ name: 'Gradient' }],
  applicationName: 'Gradient',
  alternates: { canonical: '/' },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  openGraph: {
    type: 'website',
    siteName: 'Gradient',
    title: 'Gradient | One portal for café supply',
    description:
      'Gradient connects independent cafés with the suppliers, roasters, and brands they buy from. One place to source, order, fulfil, invoice, and grow.',
    url: 'https://www.gradient365.com',
    locale: 'en_IN',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Gradient' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gradient | One portal for café supply',
    description:
      'Gradient connects independent cafés with the suppliers, roasters, and brands they buy from.',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://www.gradient365.com/#organization',
        name: 'Gradient',
        url: 'https://www.gradient365.com/',
        logo: 'https://www.gradient365.com/og-image.png',
        description:
          'Gradient connects independent cafés with the suppliers, roasters, and brands they buy from.',
        address: { '@type': 'PostalAddress', addressCountry: 'IN' },
        sameAs: ['https://www.unifiednexgrade.com'],
      },
      {
        '@type': 'WebSite',
        '@id': 'https://www.gradient365.com/#website',
        url: 'https://www.gradient365.com/',
        name: 'Gradient',
        publisher: { '@id': 'https://www.gradient365.com/#organization' },
        inLanguage: 'en-IN',
      },
    ],
  }
  return (
    <html lang="en" className={plusJakarta.variable}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <LenisProvider>{children}</LenisProvider>
        <CookieConsent />
        <SupportWidget />
      </body>
    </html>
  )
}
