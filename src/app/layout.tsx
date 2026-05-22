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
  title: 'Gradient — One portal for café supply.',
  description: 'Gradient connects independent cafés with the suppliers, roasters, and brands they buy from — and gives both sides one place to source, order, fulfil, invoice, and grow.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={plusJakarta.variable}>
      <body>
        <LenisProvider>{children}</LenisProvider>
        <CookieConsent />
        <SupportWidget />
      </body>
    </html>
  )
}
