import {
  LNav, LHero, LLogos, LDual, LShowcase, LBento, LSteps,
  LInteg, LStats, LQuotes, LPricing, LFinalCTA, LFooter,
  LProofStrip, LInlineCTA,
} from '@/components/landing/sections'
import { LScrollQuote } from '@/components/landing/ScrollQuote'

export default function HomePage() {
  return (
    <div className="l-page">
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
      <LFinalCTA />
      <LFooter />
    </div>
  )
}
