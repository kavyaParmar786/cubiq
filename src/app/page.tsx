// Force dynamic — child components fetch from Supabase (plans, server count)
export const dynamic = 'force-dynamic'

import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import HeroSection from '@/components/minecraft/HeroSection'
import FeaturesSection from '@/components/minecraft/FeaturesSection'
import PricingPreview from '@/components/minecraft/PricingPreview'
import TestimonialsSection from '@/components/minecraft/TestimonialsSection'
import FAQSection from '@/components/minecraft/FAQSection'
import CTASection from '@/components/minecraft/CTASection'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-mc-dark-bg">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <PricingPreview />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
