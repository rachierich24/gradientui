import NavHeader    from '@/components/NavHeader'
import HeroSection  from '@/components/HeroSection'
import StatsSection from '@/components/StatsSection'
import HowItWorks   from '@/components/HowItWorks'
import Footer       from '@/components/Footer'

export default function HomePage() {
  return (
    <>
      <NavHeader />
      <main>
        <HeroSection />
        <StatsSection />
        <HowItWorks />
      </main>
      <Footer />
    </>
  )
}
