import {
  LNav, LHero, LLogos, LDual, LShowcase, LBento, LSteps,
  LInteg, LStats, LQuotes, LPricing, LFooter,
  LProofStrip, LInlineCTA,
} from '@/components/landing/sections'
import { LScrollQuote } from '@/components/landing/ScrollQuote'
import { LSpectrumRail } from '@/components/landing/SpectrumRail'

export default function HomePage() {
  return (
    <div className="l-page">
      <LSpectrumRail />
      <LNav />
      <LHero />
      <LProofStrip />
      <LLogos />
      <LDual />
      <LShowcase />
      <LBento />
      <LInlineCTA />
      <LSteps />
      <LInteg />
      <LStats />
      <LScrollQuote />
      <LQuotes />
      <LPricing />
      <LFooter />
    </div>
  )
}
