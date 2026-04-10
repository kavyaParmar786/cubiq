'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Check, Zap, Star, ArrowRight } from 'lucide-react'

const plans = [
  {
    name: 'DIRT',
    icon: '🪨',
    price: '99',
    ram: '1GB',
    cpu: '1 vCore',
    storage: '10GB SSD',
    players: 'Up to 5',
    borderClass: 'border-mc-card-border hover:border-mc-stone/50',
    highlight: false,
    features: ['Vanilla / Paper', 'Basic DDoS Protection', 'Daily Backups', 'Email Support'],
    tag: null,
  },
  {
    name: 'DIAMOND',
    icon: '💎',
    price: '249',
    ram: '4GB',
    cpu: '2 vCores',
    storage: '40GB NVMe',
    players: 'Up to 20',
    borderClass: 'border-mc-diamond',
    highlight: true,
    features: ['All Modpacks', 'Advanced DDoS', 'Hourly Backups', 'Priority Support', 'Custom Domain'],
    tag: 'MOST POPULAR',
  },
  {
    name: 'NETHERITE',
    icon: '⚔️',
    price: '599',
    ram: '16GB',
    cpu: '4 vCores',
    storage: '100GB NVMe',
    players: 'Unlimited',
    borderClass: 'border-mc-gold/60 hover:border-mc-gold',
    highlight: false,
    features: ['All Modpacks', 'Maximum DDoS', 'Real-time Backups', '24/7 Priority', 'Dedicated IP', 'BungeeCord Ready'],
    tag: null,
  },
]

export default function PricingPreview() {
  return (
    <section className="py-28 relative">
      {/* Subtle bg accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-mc-grass/[0.03] via-transparent to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-mc-diamond/30 bg-mc-diamond/5 mb-6">
            <div className="w-1.5 h-1.5 bg-mc-diamond" style={{ boxShadow: '0 0 6px #4EEBD0' }} />
            <span className="text-mc-diamond text-xs font-mono uppercase tracking-widest">Pricing Plans</span>
          </div>
          <h2 className="text-white mb-4" style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', lineHeight: '2.2rem' }}>
            START SMALL,<br />
            <span className="text-mc-gold" style={{ textShadow: '0 0 20px rgba(255,215,0,0.3)' }}>SCALE BIG</span>
          </h2>
          <p className="text-gray-500 font-body">No hidden fees. No contracts. Cancel anytime.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: plan.highlight ? 0 : -4 }}
              className={`mc-card p-8 relative border-2 transition-all duration-300 ${plan.borderClass} ${plan.highlight ? 'shadow-[0_0_40px_rgba(78,235,208,0.12)]' : ''}`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-mc-diamond text-mc-obsidian px-4 py-1.5 text-xs font-mono flex items-center gap-1.5 font-bold whitespace-nowrap">
                  <Star size={10} fill="currentColor" />
                  {plan.tag}
                </div>
              )}

              <div className="text-4xl mb-4">{plan.icon}</div>
              <h3 className="text-white font-minecraft text-sm mb-2" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                {plan.name}
              </h3>
              <div className="mb-5 flex items-end gap-1">
                <span className="text-4xl font-body font-bold text-white">₹{plan.price}</span>
                <span className="text-gray-500 text-sm font-body mb-1">/month</span>
              </div>

              {/* Specs */}
              <div className="bg-mc-dark-bg border border-mc-card-border p-4 mb-6 grid grid-cols-2 gap-y-3 gap-x-2 text-xs font-mono">
                {[
                  { label: 'RAM', value: plan.ram, color: 'text-mc-diamond' },
                  { label: 'CPU', value: plan.cpu, color: 'text-white' },
                  { label: 'Disk', value: plan.storage, color: 'text-white' },
                  { label: 'Players', value: plan.players, color: 'text-mc-emerald' },
                ].map(({ label, value, color }) => (
                  <div key={label}>
                    <div className="text-gray-600 mb-0.5">{label}</div>
                    <div className={color}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Features */}
              <ul className="space-y-2.5 mb-8">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-center gap-2.5 text-sm font-body text-gray-400">
                    <Check size={13} className="text-mc-emerald flex-shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>

              <Link
                href="/pricing"
                className={`w-full flex items-center justify-center gap-2 py-3.5 text-sm uppercase tracking-wider font-body transition-all duration-200 group ${
                  plan.highlight
                    ? 'mc-btn-diamond'
                    : 'border-2 border-mc-card-border text-gray-400 hover:border-mc-diamond hover:text-mc-diamond'
                }`}
              >
                <Zap size={13} />
                Get Started
                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="text-center mt-10"
        >
          <Link href="/pricing" className="text-mc-diamond text-sm font-mono hover:text-white transition-colors inline-flex items-center gap-2">
            View all plans including Bot Hosting
            <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
