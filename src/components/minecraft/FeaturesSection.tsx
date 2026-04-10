'use client'

import { motion } from 'framer-motion'
import { Shield, Zap, HardDrive, Globe, Clock, Headphones, Code, BarChart2 } from 'lucide-react'

const features = [
  {
    icon: Shield,
    title: 'DDoS Protection',
    desc: 'Enterprise-grade DDoS mitigation up to 1Tbps. Your server stays online even under the heaviest attacks.',
    color: 'text-mc-redstone',
    border: 'border-red-900/30 hover:border-mc-redstone/40',
    iconBg: 'bg-red-950/40',
    badge: 'PROTECTED',
    badgeColor: 'text-mc-redstone border-red-900/60',
    glow: 'rgba(255,51,51,0.08)',
  },
  {
    icon: Zap,
    title: 'Instant Deploy',
    desc: 'Your server goes live in under 60 seconds. No waiting, no queue. Choose your plan and launch.',
    color: 'text-mc-gold',
    border: 'border-yellow-900/30 hover:border-mc-gold/40',
    iconBg: 'bg-yellow-950/40',
    badge: '< 60s',
    badgeColor: 'text-mc-gold border-yellow-800/60',
    glow: 'rgba(255,215,0,0.08)',
  },
  {
    icon: HardDrive,
    title: 'NVMe SSD',
    desc: '100% NVMe SSD storage on all plans. Lightning-fast chunk loading and zero lag disk I/O.',
    color: 'text-mc-diamond',
    border: 'border-teal-900/30 hover:border-mc-diamond/40',
    iconBg: 'bg-teal-950/40',
    badge: 'NVME',
    badgeColor: 'text-mc-diamond border-teal-800/60',
    glow: 'rgba(78,235,208,0.08)',
  },
  {
    icon: Globe,
    title: 'Global Network',
    desc: 'Nodes in India, US, Europe, and Asia. Pick the closest region for minimum latency.',
    color: 'text-mc-emerald',
    border: 'border-green-900/30 hover:border-mc-emerald/40',
    iconBg: 'bg-green-950/40',
    badge: '5 REGIONS',
    badgeColor: 'text-mc-emerald border-green-800/60',
    glow: 'rgba(0,255,90,0.08)',
  },
  {
    icon: Clock,
    title: '99.9% Uptime',
    desc: 'Guaranteed 99.9% uptime SLA. Automated failover and redundant power infrastructure.',
    color: 'text-purple-400',
    border: 'border-purple-900/30 hover:border-purple-400/40',
    iconBg: 'bg-purple-950/40',
    badge: 'SLA',
    badgeColor: 'text-purple-400 border-purple-800/60',
    glow: 'rgba(167,139,250,0.08)',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    desc: 'Real humans, not bots. Get help via live chat, Discord, or ticket system — anytime.',
    color: 'text-blue-400',
    border: 'border-blue-900/30 hover:border-blue-400/40',
    iconBg: 'bg-blue-950/40',
    badge: 'LIVE',
    badgeColor: 'text-blue-400 border-blue-800/60',
    glow: 'rgba(96,165,250,0.08)',
  },
  {
    icon: Code,
    title: 'Modpack Support',
    desc: 'One-click Forge, Fabric, Paper, Spigot installs. 100+ modpacks ready to deploy instantly.',
    color: 'text-orange-400',
    border: 'border-orange-900/30 hover:border-orange-400/40',
    iconBg: 'bg-orange-950/40',
    badge: '100+ PACKS',
    badgeColor: 'text-orange-400 border-orange-800/60',
    glow: 'rgba(251,146,60,0.08)',
  },
  {
    icon: BarChart2,
    title: 'Live Analytics',
    desc: 'Real-time CPU, RAM, TPS, and player count graphs. Know exactly what\'s happening in your server.',
    color: 'text-pink-400',
    border: 'border-pink-900/30 hover:border-pink-400/40',
    iconBg: 'bg-pink-950/40',
    badge: 'REALTIME',
    badgeColor: 'text-pink-400 border-pink-800/60',
    glow: 'rgba(244,114,182,0.08)',
  },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } }
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

export default function FeaturesSection() {
  return (
    <section className="py-28 relative">
      <div className="absolute inset-0 grid-bg opacity-15" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-mc-diamond/[0.02] to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-mc-grass/30 bg-mc-grass/5 mb-6">
            <div className="w-1.5 h-1.5 bg-mc-grass" />
            <span className="text-mc-grass text-xs font-mono uppercase tracking-widest">Why Cubiq Host</span>
          </div>
          <h2 className="text-white mb-5" style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)', lineHeight: '2.2rem' }}>
            ENTERPRISE FEATURES,<br />
            <span className="text-mc-diamond" style={{ textShadow: '0 0 20px rgba(78,235,208,0.3)' }}>GAMER PRICES</span>
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto font-body text-base">
            Everything you need to run a flawless Minecraft server or Discord bot — without the enterprise price tag.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {features.map((feat) => (
            <motion.div
              key={feat.title}
              variants={cardVariants}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className={`mc-card p-6 border transition-all duration-300 cursor-default group relative overflow-hidden ${feat.border}`}
              style={{ '--glow': feat.glow } as React.CSSProperties}
            >
              {/* Hover glow bg */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `radial-gradient(circle at 30% 30%, ${feat.glow}, transparent 70%)` }} />

              <div className={`relative inline-flex p-2.5 mb-4 ${feat.iconBg} border border-white/5`}>
                <feat.icon size={22} className={feat.color} strokeWidth={1.5} />
              </div>
              <div className={`mc-badge mb-3 text-xs ${feat.badgeColor}`}>{feat.badge}</div>
              <h3 className="text-white font-body font-semibold text-base mb-2 tracking-wide">{feat.title}</h3>
              <p className="text-gray-500 text-sm font-body leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
