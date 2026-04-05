import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Gradient 365',
  description: 'B2B cafe ordering platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
