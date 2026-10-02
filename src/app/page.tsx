import {
  LNav, LLogos, LBento, LSteps,
  LInteg, LStats, LQuotes, LPricing,
  LProofStrip, LInlineCTA,
} from '@/components/landing/sections'
import { LScrollQuote } from '@/components/landing/ScrollQuote'
import { LSpectrumRail } from '@/components/landing/SpectrumRail'
import { LandingUniverse } from '@/components/landing/LandingUniverse'
import { EcosystemShowcase } from '@/components/landing/EcosystemShowcase'
import { ProductSections } from '@/components/landing/ProductSections'
import { SpotlightSection } from '@/components/landing/SpotlightSection'
import { G365Hero, G365Footer } from '@/components/landing/G365'

export default function HomePage() {
  return (
    <div className="l-page">
      <LSpectrumRail />
      <LNav />
      <G365Hero />
      <LandingUniverse>
        <EcosystemShowcase />
        <ProductSections />
      </LandingUniverse>
      <SpotlightSection />
      <LProofStrip />
      <LLogos />
      <LBento />
      <LInlineCTA />
      <LSteps />
      <LInteg />
      <LStats />
      <LScrollQuote />
      <LQuotes />
      <LPricing />
      <G365Footer />
    </div>
  )
}
