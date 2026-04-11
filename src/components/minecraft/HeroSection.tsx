'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Zap, Shield, Cpu, ArrowRight } from 'lucide-react'

const floatingBlocks = [
  { color: 'bg-mc-grass border-mc-grass-dark', top: '15%', left: '8%', delay: 0, size: 'w-10 h-10' },
  { color: 'bg-mc-diamond border-teal-600', top: '25%', right: '10%', delay: 0.5, size: 'w-8 h-8' },
  { color: 'bg-mc-gold border-yellow-600', top: '60%', left: '5%', delay: 1, size: 'w-6 h-6' },
  { color: 'bg-mc-redstone border-red-700', top: '45%', right: '7%', delay: 0.8, size: 'w-7 h-7' },
  { color: 'bg-mc-dirt border-mc-dirt-dark', top: '70%', right: '15%', delay: 1.5, size: 'w-5 h-5' },
  { color: 'bg-mc-stone border-gray-600', top: '80%', left: '12%', delay: 0.3, size: 'w-9 h-9' },
]

const stats = [
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '< 1ms', label: 'Ping Response' },
  { value: '10K+', label: 'Servers Hosted' },
  { value: '24/7', label: 'Support' },
]

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-hero-gradient" />
      <div className="absolute inset-0 grid-bg opacity-40" />

      {/* Scanline effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.5) 2px, rgba(0,0,0,0.5) 4px)',
        }}
      />

      {/* Floating Blocks */}
      {floatingBlocks.map((block, i) => (
        <motion.div
          key={i}
          className={`absolute ${block.size} ${block.color} border-2 pixel-art`}
          style={{ top: block.top, left: block.left, right: block.right }}
          animate={{ y: [0, -12, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3 + i * 0.5, delay: block.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center pt-24 pb-16">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 border border-mc-grass/40 bg-mc-grass/10 mb-8"
        >
          <div className="w-2 h-2 bg-mc-emerald" style={{ boxShadow: '0 0 6px #00FF5A' }} />
          <span className="text-mc-emerald text-xs font-mono uppercase tracking-widest">
            v2.0 — Now with Instant Deploy
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-6"
          style={{ fontFamily: "'Press Start 2P', monospace" }}
        >
          <span className="block text-2xl sm:text-3xl md:text-4xl text-white leading-relaxed mb-4">
            POWERFUL
          </span>
          <span className="block text-2xl sm:text-3xl md:text-5xl leading-relaxed" style={{ color: '#4EEBD0', textShadow: '0 0 15px rgba(78,235,208,0.5), 0 0 30px rgba(78,235,208,0.25)' }}>
            MINECRAFT
          </span>
          <span className="block text-xl sm:text-2xl md:text-3xl text-white leading-relaxed mt-2">
            &amp; BOT HOSTING
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-gray-400 text-lg font-body max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Deploy your Minecraft server or Discord bot in under 60 seconds. Enterprise-grade hardware, DDoS protection, and 24/7 support — built for serious players.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
        >
          <Link href="/pricing" className="mc-btn text-sm px-8 py-4 flex items-center gap-3">
            <Zap size={16} />
            Deploy Now — From ₹99/mo
            <ArrowRight size={14} />
          </Link>
          <Link href="/features" className="mc-btn-outline px-8 py-4 text-sm border-2 border-mc-card-border text-gray-300 hover:border-mc-diamond hover:text-mc-diamond transition-all duration-200 flex items-center gap-2">
            View Features
          </Link>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-px bg-mc-card-border max-w-3xl mx-auto"
        >
          {stats.map(({ value, label }) => (
            <div key={label} className="bg-mc-dark-bg px-6 py-5 text-center">
              <div className="text-2xl font-minecraft text-mc-diamond mb-1" style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '1.25rem' }}>
                {value}
              </div>
              <div className="text-gray-500 text-xs font-mono uppercase tracking-wider">{label}</div>
            </div>
          ))}
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-12 flex flex-wrap gap-6 justify-center items-center text-gray-600 text-xs font-mono"
        >
          {[
            { Icon: Shield, text: 'DDoS Protected' },
            { Icon: Cpu, text: 'NVMe SSD Storage' },
            { Icon: Zap, text: 'Instant Provisioning' },
          ].map(({ Icon, text }) => (
            <div key={text} className="flex items-center gap-2">
              <Icon size={14} className="text-gray-500" />
              {text}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom grass border */}
      <div className="absolute bottom-0 left-0 right-0 h-4 pixel-divider opacity-60" />
    </section>
  )
}
