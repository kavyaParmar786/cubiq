'use client'

import { motion } from 'framer-motion'
import { Shield, Zap, HardDrive, Globe, Clock, Headphones, Code, BarChart2 } from 'lucide-react'

const features = [
  {
    icon: Shield,
    title: 'DDoS Protection',
    desc: 'Enterprise-grade DDoS mitigation up to 1Tbps. Your server stays online even under attack.',
    color: 'text-mc-redstone',
    glow: 'shadow-redstone-glow',
    border: 'border-red-900/30',
    badge: 'PROTECTED',
    badgeColor: 'text-mc-redstone border-red-900',
  },
  {
    icon: Zap,
    title: 'Instant Deploy',
    desc: 'Your server goes live in under 60 seconds. No waiting, no queue. Just choose and launch.',
    color: 'text-mc-gold',
    glow: 'shadow-gold-glow',
    border: 'border-yellow-900/30',
    badge: '< 60s',
    badgeColor: 'text-mc-gold border-yellow-800',
  },
  {
    icon: HardDrive,
    title: 'NVMe SSD',
    desc: '100% NVMe SSD storage on all plans. Lightning-fast chunk loading and zero lag disk I/O.',
    color: 'text-mc-diamond',
    glow: 'shadow-diamond-glow',
    border: 'border-teal-900/30',
    badge: 'NVME',
    badgeColor: 'text-mc-diamond border-teal-800',
  },
  {
    icon: Globe,
    title: 'Global Network',
    desc: 'Nodes in India, US, Europe, and Asia. Pick the region closest to your players for minimum latency.',
    color: 'text-mc-emerald',
    glow: 'shadow-emerald-glow',
    border: 'border-green-900/30',
    badge: '5 REGIONS',
    badgeColor: 'text-mc-emerald border-green-800',
  },
  {
    icon: Clock,
    title: '99.9% Uptime',
    desc: 'Guaranteed 99.9% uptime SLA. Automated failover and redundant power infrastructure.',
    color: 'text-purple-400',
    glow: '',
    border: 'border-purple-900/30',
    badge: 'SLA',
    badgeColor: 'text-purple-400 border-purple-800',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    desc: 'Real humans, not bots. Get help via live chat, Discord, or ticket system anytime.',
    color: 'text-blue-400',
    glow: '',
    border: 'border-blue-900/30',
    badge: 'LIVE',
    badgeColor: 'text-blue-400 border-blue-800',
  },
  {
    icon: Code,
    title: 'Modpack Support',
    desc: 'One-click Forge, Fabric, Paper, Spigot installs. 100+ modpacks ready to deploy.',
    color: 'text-orange-400',
    glow: '',
    border: 'border-orange-900/30',
    badge: '100+ PACKS',
    badgeColor: 'text-orange-400 border-orange-800',
  },
  {
    icon: BarChart2,
    title: 'Live Analytics',
    desc: 'Real-time CPU, RAM, TPS, and player count graphs. Know exactly what\'s happening.',
    color: 'text-pink-400',
    glow: '',
    border: 'border-pink-900/30',
    badge: 'REALTIME',
    badgeColor: 'text-pink-400 border-pink-800',
  },
]

export default function FeaturesSection() {
  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-mc-grass/30 bg-mc-grass/5 mb-6">
            <span className="text-mc-grass text-xs font-mono uppercase tracking-widest">Why Cubiq Host</span>
          </div>
          <h2 className="text-white mb-4" style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '1.5rem', lineHeight: '2rem' }}>
            ENTERPRISE FEATURES,
            <br />
            <span className="text-mc-diamond">GAMER PRICES</span>
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto font-body">
            Everything you need to run a flawless Minecraft server or Discord bot — without the enterprise price tag.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className={`mc-card p-6 hover:border-mc-card-border group cursor-default transition-all duration-300 border ${feat.border}`}
              whileHover={{ y: -4 }}
            >
              <div className={`mb-4 ${feat.color}`}>
                <feat.icon size={28} strokeWidth={1.5} />
              </div>
              <div className={`mc-badge mb-3 ${feat.badgeColor}`}>
                {feat.badge}
              </div>
              <h3 className="text-white font-body font-semibold text-base mb-2 tracking-wide">
                {feat.title}
              </h3>
              <p className="text-gray-500 text-sm font-body leading-relaxed">
                {feat.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
