'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

const testimonials = [
  {
    name: 'Alex_Miner',
    role: 'Server Owner — 200 players',
    avatar: '🪖',
    rating: 5,
    text: 'Migrated from another host and the difference is night and day. Zero lag, instant support, and the panel is incredible. My players noticed immediately.',
    plan: 'NETHERITE',
  },
  {
    name: 'DevBot_Riya',
    role: 'Discord Bot Developer',
    avatar: '🤖',
    rating: 5,
    text: "Best bot hosting I've found. Uploading my Node.js bot and deploying it took less than 2 minutes. It's been running 24/7 without a single downtime.",
    plan: 'BOT PRO',
  },
  {
    name: 'CraftedByKaran',
    role: 'SMP Network Admin',
    avatar: '⚔️',
    rating: 5,
    text: 'Running 3 servers on Cubiq. The live stats panel is a game changer — I can see exactly what\'s causing lag spikes. Support team is elite.',
    plan: 'DIAMOND x3',
  },
  {
    name: 'PixelQueen_Zoe',
    role: 'Modded MC Creator',
    avatar: '🌸',
    rating: 5,
    text: 'One-click Fabric install works flawlessly. Had a full modded server with 50 mods running in under 5 minutes. Absolutely no comparison to what I was using before.',
    plan: 'DIAMOND',
  },
  {
    name: 'NetworkDev_Sam',
    role: 'BungeeCord Network',
    avatar: '🛡️',
    rating: 5,
    text: 'The DDoS protection is real. We got hit with a 50Gbps flood last month and stayed online the entire time. Worth every rupee.',
    plan: 'NETHERITE',
  },
  {
    name: 'LegacySMP',
    role: 'Whitelist SMP Owner',
    avatar: '🏰',
    rating: 5,
    text: 'Clean UI, clean servers, clean support. Cubiq just works. Their team even helped me configure Paper optimizations for free.',
    plan: 'DIRT → DIAMOND',
  },
]

export default function TestimonialsSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-mc-grass/3 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-mc-gold/30 bg-mc-gold/5 mb-6">
            <span className="text-mc-gold text-xs font-mono uppercase tracking-widest">Player Reviews</span>
          </div>
          <h2 className="text-white mb-4" style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '1.4rem', lineHeight: '2rem' }}>
            TRUSTED BY<br />
            <span className="text-mc-gold">10,000+ SERVERS</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="mc-card p-6 hover:border-mc-card-border transition-all duration-300"
              whileHover={{ y: -3 }}
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, si) => (
                  <Star key={si} size={12} className="text-mc-gold fill-mc-gold" />
                ))}
              </div>

              <p className="text-gray-400 text-sm font-body leading-relaxed mb-6">
                "{t.text}"
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-mc-hover-bg border border-mc-card-border flex items-center justify-center text-xl pixel-art">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-white text-sm font-body font-semibold">{t.name}</div>
                    <div className="text-gray-600 text-xs font-mono">{t.role}</div>
                  </div>
                </div>
                <div className="mc-badge text-mc-diamond border-teal-800 text-xs">
                  {t.plan}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
