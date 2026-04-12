// Force dynamic rendering — this page fetches plans from Supabase
export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import PricingContent from '@/components/minecraft/PricingContent'

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Affordable Minecraft server and Discord bot hosting plans. Starting from ₹99/month.',
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-mc-dark-bg">
      <Navbar />
      <main className="pt-24">
        <PricingContent />
      </main>
      <Footer />
    </div>
  )
}
