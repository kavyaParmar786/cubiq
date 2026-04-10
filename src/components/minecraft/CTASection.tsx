'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Zap, ArrowRight, MessageSquare } from 'lucide-react'

export default function CTASection() {
  return (
    <section className="py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-mc-grass/5 via-mc-grass/8 to-mc-grass/5" />
      <div className="absolute inset-0 grid-bg opacity-20" />

      {/* Decorative blocks */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute pixel-art opacity-10"
          style={{
            width: `${12 + (i % 3) * 6}px`,
            height: `${12 + (i % 3) * 6}px`,
            background: i % 3 === 0 ? '#5D9E2F' : i % 3 === 1 ? '#4EEBD0' : '#FFD700',
            border: '2px solid rgba(0,0,0,0.3)',
            top: `${15 + i * 10}%`,
            left: i % 2 === 0 ? `${1 + i * 0.5}%` : undefined,
            right: i % 2 !== 0 ? `${1 + i * 0.5}%` : undefined,
          }}
          animate={{ y: [0, -12, 0], rotate: [0, 12, -12, 0] }}
          transition={{ duration: 3 + i * 0.5, delay: i * 0.3, repeat: Infinity }}
        />
      ))}

      <div className="relative max-w-4xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mc-card p-12 sm:p-16 border-2 border-mc-grass/30 relative overflow-hidden"
          style={{ boxShadow: '0 0 80px rgba(93,158,47,0.08), 0 0 160px rgba(78,235,208,0.04)' }}
        >
          {/* Inner glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-mc-grass/5 to-transparent pointer-events-none" />

          <motion.div
            className="text-6xl mb-6 relative z-10"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            ⚡
          </motion.div>

          <h2 className="text-white mb-5 relative z-10" style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', lineHeight: '2.2rem' }}>
            READY TO BUILD<br />
            <span className="text-mc-diamond" style={{ textShadow: '0 0 20px rgba(78,235,208,0.4)' }}>YOUR WORLD?</span>
          </h2>

          <p className="text-gray-400 font-body max-w-xl mx-auto mb-10 text-lg leading-relaxed relative z-10">
            Join 10,000+ server owners who chose Cubiq Host. Deploy in 60 seconds. Scale anytime. Cancel anytime.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <Link href="/register" className="group mc-btn text-sm px-10 py-4 flex items-center justify-center gap-3 relative overflow-hidden">
              <span className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12" />
              <Zap size={16} />
              Start Your Server — Free Setup
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="https://discord.gg/QE6VmHXsUp"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-indigo-800/60 bg-indigo-950/30 text-indigo-300 hover:border-indigo-500 hover:text-indigo-200 transition-all duration-200 px-10 py-4 text-sm uppercase tracking-wider font-body flex items-center justify-center gap-2"
            >
              <MessageSquare size={16} />
              Join Discord
            </a>
          </div>

          <p className="text-gray-600 text-xs font-mono mt-8 relative z-10">
            7-day money-back guarantee · No credit card required for account creation
          </p>
        </motion.div>
      </div>
    </section>
  )
}
