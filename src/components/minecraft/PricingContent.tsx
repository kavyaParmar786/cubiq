'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Check, Zap, Star, Bot, Server } from 'lucide-react'

const mcPlans = [
  {
    name: 'DIRT',
    emoji: '🪨',
    price: 99,
    ram: '1GB',
    cpu: '1 vCore',
    storage: '10GB SSD',
    bandwidth: '1TB',
    players: '1–5',
    backups: '1 Daily',
    popular: false,
    color: 'border-mc-card-border',
    accentColor: 'text-mc-stone',
    features: [
      'Vanilla / Paper / Spigot',
      'Basic DDoS Protection',
      '1 Daily Backup',
      'Standard Support (48h)',
      'Shared IP + Port',
      'Subdomain (*.cubiqhost.com)',
    ],
    missing: ['Custom Domain', 'Modpacks', 'Plugin Installer', 'Priority Support'],
  },
  {
    name: 'IRON',
    emoji: '⚙️',
    price: 179,
    ram: '2GB',
    cpu: '1 vCore',
    storage: '20GB NVMe',
    bandwidth: '2TB',
    players: '5–15',
    backups: '3 Daily',
    popular: false,
    color: 'border-mc-stone/40',
    accentColor: 'text-mc-stone',
    features: [
      'Vanilla / Paper / Spigot / Forge',
      'Enhanced DDoS Protection',
      '3 Daily Backups',
      'Standard Support (24h)',
      'Shared IP + Port',
      'Plugin Installer',
      'Subdomain',
    ],
    missing: ['Custom Domain', 'Priority Support'],
  },
  {
    name: 'DIAMOND',
    emoji: '💎',
    price: 349,
    ram: '4GB',
    cpu: '2 vCores',
    storage: '40GB NVMe',
    bandwidth: '5TB',
    players: '15–30',
    backups: 'Hourly',
    popular: true,
    color: 'border-mc-diamond',
    accentColor: 'text-mc-diamond',
    features: [
      'All Server Types',
      'Advanced DDoS Protection',
      'Hourly Backups',
      'Priority Support (2h)',
      'Dedicated Port',
      'Plugin + Modpack Installer',
      'Custom Domain (Free SSL)',
      'MySQL Database',
    ],
    missing: [],
  },
  {
    name: 'EMERALD',
    emoji: '🌿',
    price: 599,
    ram: '8GB',
    cpu: '3 vCores',
    storage: '60GB NVMe',
    bandwidth: '10TB',
    players: '30–60',
    backups: 'Hourly',
    popular: false,
    color: 'border-mc-emerald/40',
    accentColor: 'text-mc-emerald',
    features: [
      'All Server Types',
      'Advanced DDoS Protection',
      'Hourly Backups',
      'Priority Support (1h)',
      'Dedicated IP',
      'All Modpacks',
      'Custom Domain + SSL',
      '2x MySQL Databases',
      'BungeeCord Ready',
    ],
    missing: [],
  },
  {
    name: 'NETHERITE',
    emoji: '⚔️',
    price: 999,
    ram: '16GB',
    cpu: '4 vCores',
    storage: '100GB NVMe',
    bandwidth: 'Unlimited',
    players: 'Unlimited',
    backups: 'Real-time',
    popular: false,
    color: 'border-mc-gold',
    accentColor: 'text-mc-gold',
    features: [
      'All Server Types',
      'Maximum DDoS Protection (1Tbps)',
      'Real-time Backups',
      'Priority Support (30min)',
      'Dedicated IP',
      'All Modpacks',
      'Custom Domain + SSL',
      '5x MySQL Databases',
      'BungeeCord / Velocity Ready',
      'Sub-user Access',
      'Discord Bot Included',
    ],
    missing: [],
  },
]

const botPlans = [
  {
    name: 'BOT STARTER',
    emoji: '🤖',
    price: 79,
    ram: '512MB',
    cpu: '0.5 vCore',
    storage: '5GB SSD',
    runtimes: 'Node.js, Python',
    bots: '1 Bot',
    popular: false,
    color: 'border-mc-card-border',
  },
  {
    name: 'BOT PRO',
    emoji: '⚡',
    price: 149,
    ram: '1GB',
    cpu: '1 vCore',
    storage: '15GB SSD',
    runtimes: 'Node.js, Python, Go',
    bots: '3 Bots',
    popular: true,
    color: 'border-mc-diamond',
  },
  {
    name: 'BOT ULTRA',
    emoji: '🚀',
    price: 299,
    ram: '2GB',
    cpu: '2 vCores',
    storage: '30GB NVMe',
    runtimes: 'All runtimes',
    bots: 'Unlimited',
    popular: false,
    color: 'border-mc-gold',
  },
]

export default function PricingContent() {
  const [tab, setTab] = useState<'minecraft' | 'bots'>('minecraft')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
      {/* Header */}
      <div className="text-center mb-14">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-white mb-4" style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '1.6rem', lineHeight: '2.4rem' }}>
            CHOOSE YOUR<br />
            <span className="text-mc-diamond">PLAN</span>
          </h1>
          <p className="text-gray-400 font-body max-w-xl mx-auto">
            All plans include free setup, DDoS protection, and 7-day money-back guarantee.
          </p>
        </motion.div>

        {/* Tab Toggle */}
        <div className="flex justify-center mt-8 mb-2">
          <div className="flex border border-mc-card-border">
            <button
              onClick={() => setTab('minecraft')}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-body uppercase tracking-wider transition-all ${
                tab === 'minecraft' ? 'bg-mc-grass text-white' : 'text-gray-500 hover:text-white'
              }`}
            >
              <Server size={14} /> Minecraft
            </button>
            <button
              onClick={() => setTab('bots')}
              id="bots"
              className={`flex items-center gap-2 px-6 py-3 text-sm font-body uppercase tracking-wider transition-all border-l border-mc-card-border ${
                tab === 'bots' ? 'bg-mc-grass text-white' : 'text-gray-500 hover:text-white'
              }`}
            >
              <Bot size={14} /> Discord Bots
            </button>
          </div>
        </div>
      </div>

      {/* Minecraft Plans */}
      {tab === 'minecraft' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
        >
          {mcPlans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`mc-card p-6 relative border-2 ${plan.color} flex flex-col`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-mc-diamond text-mc-obsidian px-3 py-0.5 text-xs font-mono font-bold flex items-center gap-1 whitespace-nowrap">
                  <Star size={9} fill="currentColor" /> POPULAR
                </div>
              )}
              <div className="text-3xl mb-3">{plan.emoji}</div>
              <h3 className={`font-minecraft text-xs mb-1 ${plan.accentColor}`} style={{ fontFamily: "'Press Start 2P', monospace" }}>
                {plan.name}
              </h3>
              <div className="mb-4 mt-2">
                <span className="text-3xl font-bold text-white font-body">₹{plan.price}</span>
                <span className="text-gray-500 text-xs font-mono">/mo</span>
              </div>

              {/* Specs */}
              <div className="bg-mc-dark-bg border border-mc-card-border p-3 mb-5 text-xs font-mono grid grid-cols-2 gap-x-2 gap-y-1">
                {[
                  ['RAM', plan.ram],
                  ['CPU', plan.cpu],
                  ['Disk', plan.storage],
                  ['BW', plan.bandwidth],
                  ['Players', plan.players],
                  ['Backups', plan.backups],
                ].map(([k, v]) => (
                  <div key={k}>
                    <span className="text-gray-600">{k}</span>
                    <span className={`block ${plan.accentColor}`}>{v}</span>
                  </div>
                ))}
              </div>

              {/* Features */}
              <ul className="space-y-1.5 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs font-body text-gray-400">
                    <Check size={12} className="text-mc-emerald mt-0.5 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className={`mt-auto flex items-center justify-center gap-2 py-2.5 text-xs uppercase tracking-wider font-body transition-all ${
                  plan.popular
                    ? 'mc-btn-diamond'
                    : 'border border-mc-card-border text-gray-400 hover:border-mc-diamond hover:text-mc-diamond'
                }`}
              >
                <Zap size={12} /> Get Started
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Bot Plans */}
      {tab === 'bots' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
        >
          {botPlans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`mc-card p-8 relative border-2 ${plan.color} flex flex-col ${plan.popular ? 'scale-105' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-mc-diamond text-mc-obsidian px-3 py-0.5 text-xs font-mono font-bold flex items-center gap-1">
                  <Star size={9} fill="currentColor" /> POPULAR
                </div>
              )}
              <div className="text-4xl mb-4">{plan.emoji}</div>
              <h3 className="text-white font-minecraft text-xs mb-4" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                {plan.name}
              </h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white font-body">₹{plan.price}</span>
                <span className="text-gray-500 text-sm font-mono">/mo</span>
              </div>

              <div className="bg-mc-dark-bg border border-mc-card-border p-4 mb-6 text-xs font-mono space-y-2">
                {[
                  ['RAM', plan.ram],
                  ['CPU', plan.cpu],
                  ['Storage', plan.storage],
                  ['Runtimes', plan.runtimes],
                  ['Bots', plan.bots],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-gray-600">{k}</span>
                    <span className="text-mc-diamond">{v}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/register"
                className={`flex items-center justify-center gap-2 py-3 text-sm uppercase tracking-wider font-body transition-all ${
                  plan.popular
                    ? 'mc-btn-diamond'
                    : 'border border-mc-card-border text-gray-400 hover:border-mc-diamond hover:text-mc-diamond'
                }`}
              >
                <Zap size={14} /> Deploy Bot
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* FAQ note */}
      <div className="text-center mt-16 text-gray-500 text-sm font-body">
        All prices in INR. GST applicable at checkout. |{' '}
        <Link href="/#faq" className="text-mc-diamond hover:underline">Read our FAQ</Link>
      </div>
    </div>
  )
}
