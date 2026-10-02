import { LNav, LFaq, LFooter } from '@/components/landing/sections'
import { LSpectrumRail } from '@/components/landing/SpectrumRail'

export default function FaqPage() {
  return (
    <div className="l-page">
      <LSpectrumRail />
      <LNav />
      <div style={{ paddingTop: 120 }}>
        <LFaq />
      </div>
      <LFooter />
    </div>
  )
}
