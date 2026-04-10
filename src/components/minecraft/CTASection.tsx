'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Zap, ArrowRight } from 'lucide-react'

export default function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-mc-grass/5 via-mc-grass/10 to-mc-grass/5" />
      <div className="absolute inset-0 grid-bg opacity-30" />

      {/* Decorative blocks */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-6 h-6 bg-mc-grass border-2 border-mc-grass-dark pixel-art opacity-20"
          style={{
            top: `${20 + i * 12}%`,
            left: i % 2 === 0 ? `${2 + i}%` : undefined,
            right: i % 2 !== 0 ? `${2 + i}%` : undefined,
          }}
          animate={{ y: [0, -10, 0], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 3 + i, delay: i * 0.3, repeat: Infinity }}
        />
      ))}

      <div className="relative max-w-4xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mc-card p-12 border-2 border-mc-grass/30"
        >
          <div className="text-6xl mb-6">⚡</div>
          <h2 className="text-white mb-4" style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '1.5rem', lineHeight: '2.2rem' }}>
            READY TO BUILD<br />
            <span className="text-mc-diamond">YOUR WORLD?</span>
          </h2>
          <p className="text-gray-400 font-body max-w-xl mx-auto mb-10 text-lg">
            Join 10,000+ server owners who chose Cubiq Host. Deploy in 60 seconds. Scale anytime. Cancel anytime.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="mc-btn text-sm px-10 py-4 flex items-center justify-center gap-3">
              <Zap size={16} />
              Start Your Server — Free Setup
              <ArrowRight size={14} />
            </Link>
            <Link href="/pricing" className="border-2 border-mc-card-border text-gray-300 hover:border-mc-diamond hover:text-mc-diamond transition-all duration-200 px-10 py-4 text-sm uppercase tracking-wider font-body">
              View All Plans
            </Link>
          </div>
          <p className="text-gray-600 text-xs font-mono mt-6">
            7-day money-back guarantee · No credit card required for account creation
          </p>
        </motion.div>
      </div>
    </section>
  )
}
