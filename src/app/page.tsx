import { LNav } from '@/components/landing/sections'
import { SectionRail } from '@/components/landing/SectionRail'
import { LandingUniverse } from '@/components/landing/LandingUniverse'
import { EcosystemShowcase } from '@/components/landing/EcosystemShowcase'
import { SpotlightSection } from '@/components/landing/SpotlightSection'
import { EcosystemCards } from '@/components/landing/EcosystemCards'
import { G365Hero, G365Footer } from '@/components/landing/G365'
import { Intersystem } from '@/components/landing/Intersystem'
import { IndiaGlobe } from '@/components/landing/IndiaGlobe'

export default function HomePage() {
  return (
    <div className="l-page">
      <SectionRail />
      <LNav />
      <G365Hero />
      {/* the ecosystem, then a tour of the café, supplier and brand portals (it replaces the old red/green/purple sections) */}
      <LandingUniverse>
        <EcosystemShowcase />
      </LandingUniverse>
      <SpotlightSection />
      <EcosystemCards />
      <Intersystem />
      <IndiaGlobe />
      <G365Footer />
    </div>
  )
}
