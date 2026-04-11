'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Check, Zap, Star } from 'lucide-react'

const plans = [
  {
    name: 'DIRT',
    icon: '🪨',
    price: '99',
    ram: '1GB',
    cpu: '1 vCore',
    storage: '10GB SSD',
    players: 'Up to 5',
    color: 'border-mc-card-border',
    highlight: false,
    features: ['Vanilla / Paper', 'Basic DDoS Protection', 'Daily Backups', 'Email Support'],
  },
  {
    name: 'DIAMOND',
    icon: '💎',
    price: '249',
    ram: '4GB',
    cpu: '2 vCores',
    storage: '40GB NVMe',
    players: 'Up to 20',
    color: 'border-mc-diamond',
    highlight: true,
    features: ['All Modpacks', 'Advanced DDoS', 'Hourly Backups', 'Priority Support', 'Custom Domain'],
  },
  {
    name: 'NETHERITE',
    icon: '⚔️',
    price: '599',
    ram: '16GB',
    cpu: '4 vCores',
    storage: '100GB NVMe',
    players: 'Unlimited',
    color: 'border-mc-gold',
    highlight: false,
    features: ['All Modpacks', 'Maximum DDoS', 'Real-time Backups', '24/7 Priority', 'Dedicated IP', 'BungeeCord Ready'],
  },
]

export default function PricingPreview() {
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
          <p className="text-gray-500 font-body">
            No hidden fees. No contracts. Cancel anytime.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`mc-card p-8 relative border-2 ${plan.color} ${plan.highlight ? 'scale-105' : ''}`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-mc-diamond text-mc-obsidian px-4 py-1 text-xs font-mono flex items-center gap-1 font-bold">
                  <Star size={10} fill="currentColor" />
                  MOST POPULAR
                </div>
              )}
              <div className="text-4xl mb-4">{plan.icon}</div>
              <h3 className="text-white font-minecraft text-sm mb-2" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                {plan.name}
              </h3>
              <div className="mb-4">
                <span className="text-4xl font-body font-bold text-white">₹{plan.price}</span>
                <span className="text-gray-500 text-sm font-body">/month</span>
              </div>

              {/* Specs */}
              <div className="bg-mc-dark-bg border border-mc-card-border p-4 mb-6 grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="text-gray-500">RAM <span className="text-mc-diamond block">{plan.ram}</span></div>
                <div className="text-gray-500">CPU <span className="text-white block">{plan.cpu}</span></div>
                <div className="text-gray-500">Disk <span className="text-white block">{plan.storage}</span></div>
                <div className="text-gray-500">Players <span className="text-mc-emerald block">{plan.players}</span></div>
              </div>

              {/* Features */}
              <ul className="space-y-2 mb-8">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-center gap-2 text-sm font-body text-gray-400">
                    <Check size={14} className="text-mc-emerald flex-shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>

              <Link
                href="/pricing"
                className={`${plan.highlight ? 'mc-btn-diamond' : 'mc-btn-outline border border-mc-card-border'} w-full flex items-center justify-center gap-2 py-3 text-sm uppercase tracking-wider transition-all`}
              >
                <Zap size={14} />
                Get Started
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/pricing" className="text-mc-diamond text-sm font-mono hover:underline">
            View all plans including Bot Hosting →
          </Link>
        </div>
      </div>
    </section>
  )
}
