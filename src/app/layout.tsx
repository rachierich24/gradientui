import type { Metadata } from 'next'
import 'lenis/dist/lenis.css'
import './landing-fonts.css'
import './landing.css'
import { LenisProvider } from '@/components/LenisProvider'
import { CookieConsent } from '@/components/CookieConsent'
import { SupportWidget } from '@/components/SupportWidget'

export const metadata: Metadata = {
  title: 'Gradient — One portal for café supply.',
  description: 'Gradient connects independent cafés with the suppliers, roasters, and brands they buy from — and gives both sides one place to source, order, fulfil, invoice, and grow.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LenisProvider>{children}</LenisProvider>
        <CookieConsent />
        <SupportWidget />
      </body>
    </html>
  )
}
