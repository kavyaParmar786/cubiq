'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Check, Zap, Star } from 'lucide-react'
import { createClient, type Plan } from '@/lib/supabase'

const PLAN_ICONS: Record<string, string> = {
  dirt: '🪨', iron: '⚙️', diamond: '💎',
  emerald: '🌿', netherite: '⚔️',
}

const PLAN_COLORS: Record<string, { border: string; accent: string }> = {
  dirt:      { border: 'border-mc-card-border',  accent: 'text-mc-stone' },
  iron:      { border: 'border-gray-600/40',      accent: 'text-gray-300' },
  diamond:   { border: 'border-mc-diamond',       accent: 'text-mc-diamond' },
  emerald:   { border: 'border-mc-emerald/40',    accent: 'text-mc-emerald' },
  netherite: { border: 'border-mc-gold',          accent: 'text-mc-gold' },
}

// Show only 3 plans on homepage: cheapest, featured, most expensive
function pickShowcasePlans(plans: Plan[]) {
  const mc = plans.filter(p => p.type === 'minecraft' && p.is_active)
  if (!mc.length) return []
  const featured = mc.find(p => p.is_featured) || mc[Math.floor(mc.length / 2)]
  const cheapest = mc[0]
  const priciest = mc[mc.length - 1]
  // Deduplicate
  const picked = [cheapest, featured, priciest]
  return picked.filter((p, i, arr) => arr.findIndex(x => x.id === p.id) === i).slice(0, 3)
}

export default function PricingPreview() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase
      .from('plans')
      .select('*')
      .eq('type', 'minecraft')
      .eq('is_active', true)
      .order('sort_order')
      .then(({ data }) => {
        setPlans(data || [])
        setLoading(false)
      })
  }, [])

  const showcase = pickShowcasePlans(plans)

  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-mc-diamond/30 bg-mc-diamond/5 mb-6">
            <span className="text-mc-diamond text-xs font-mono uppercase tracking-widest">Pricing Plans</span>
          </div>
          <h2 className="text-white mb-4" style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '1.4rem', lineHeight: '2rem' }}>
            START SMALL,<br />
            <span className="text-mc-gold">SCALE BIG</span>
          </h2>
          <p className="text-gray-500 font-body">No hidden fees. No contracts. Cancel anytime.</p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="mc-card border border-mc-card-border w-72 h-80 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {showcase.map((plan, i) => {
              const colors = PLAN_COLORS[plan.name] || PLAN_COLORS.iron
              const icon = PLAN_ICONS[plan.name] || '📦'
              const ramGB = Math.round(plan.ram / 1024)
              const cpuCores = plan.cpu / 100
              const diskGB = Math.round(plan.disk / 1024)

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`mc-card p-8 relative border-2 ${colors.border} flex flex-col ${plan.is_featured ? 'scale-105' : ''}`}
                >
                  {plan.is_featured && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-mc-diamond text-mc-obsidian px-4 py-1 text-xs font-mono flex items-center gap-1 font-bold whitespace-nowrap">
                      <Star size={10} fill="currentColor" /> MOST POPULAR
                    </div>
                  )}

                  <div className="text-4xl mb-4">{icon}</div>
                  <h3 className={`font-minecraft text-sm mb-2 ${colors.accent}`} style={{ fontFamily: "'Press Start 2P', monospace" }}>
                    {plan.display_name}
                  </h3>
                  <div className="mb-4 mt-2">
                    <span className="text-4xl font-body font-bold text-white">₹{plan.price}</span>
                    <span className="text-gray-500 text-sm font-body">/month</span>
                  </div>

                  {/* Specs */}
                  <div className="bg-mc-dark-bg border border-mc-card-border p-4 mb-6 grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="text-gray-600">RAM <span className={`block ${colors.accent}`}>{ramGB}GB</span></div>
                    <div className="text-gray-600">CPU <span className="block text-white">{cpuCores} vCore{cpuCores > 1 ? 's' : ''}</span></div>
                    <div className="text-gray-600">Disk <span className="block text-white">{diskGB}GB</span></div>
                    <div className="text-gray-600">Players <span className="block text-mc-emerald">{plan.max_players >= 999 ? 'Unlimited' : `Up to ${plan.max_players}`}</span></div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2 mb-8 flex-1">
                    {(plan.features || []).slice(0, 4).map((feat) => (
                      <li key={feat} className="flex items-center gap-2 text-sm font-body text-gray-400">
                        <Check size={14} className="text-mc-emerald flex-shrink-0" />
                        {feat}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/register"
                    className={`${plan.is_featured ? 'mc-btn-diamond' : 'border border-mc-card-border text-gray-400 hover:border-mc-diamond hover:text-mc-diamond transition-all'} w-full flex items-center justify-center gap-2 py-3 text-sm uppercase tracking-wider font-body`}
                  >
                    <Zap size={14} />
                    Get Started
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}

        <div className="text-center mt-8">
          <Link href="/pricing" className="text-mc-diamond text-sm font-mono hover:underline">
            View all plans including Bot Hosting →
          </Link>
        </div>
      </div>
    </section>
  )
}
