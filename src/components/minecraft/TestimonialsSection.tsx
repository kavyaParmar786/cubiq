'use client'

import { motion, useAnimationFrame } from 'framer-motion'
import { Star, Quote } from 'lucide-react'
import { useRef, useState } from 'react'

const testimonials = [
  {
    name: 'Alex_Miner',
    role: 'Server Owner — 200 players',
    avatar: '🪖',
    rating: 5,
    text: 'Migrated from another host and the difference is night and day. Zero lag, instant support, and the panel is incredible.',
    plan: 'NETHERITE',
  },
  {
    name: 'DevBot_Riya',
    role: 'Discord Bot Developer',
    avatar: '🤖',
    rating: 5,
    text: "Best bot hosting I've found. Uploading my Node.js bot took under 2 minutes. It's been running 24/7 without a single downtime.",
    plan: 'BOT PRO',
  },
  {
    name: 'CraftedByKaran',
    role: 'SMP Network Admin',
    avatar: '⚔️',
    rating: 5,
    text: 'Running 3 servers on Cubiq. The live stats panel is a game changer. Support team is genuinely elite.',
    plan: 'DIAMOND x3',
  },
  {
    name: 'PixelQueen_Zoe',
    role: 'Modded MC Creator',
    avatar: '🌸',
    rating: 5,
    text: 'One-click Fabric install works flawlessly. Full modded server with 50 mods running in under 5 minutes.',
    plan: 'DIAMOND',
  },
  {
    name: 'NetworkDev_Sam',
    role: 'BungeeCord Network',
    avatar: '🛡️',
    rating: 5,
    text: 'The DDoS protection is real. We got hit with a 50Gbps flood and stayed online the entire time. Worth every rupee.',
    plan: 'NETHERITE',
  },
  {
    name: 'LegacySMP',
    role: 'Whitelist SMP Owner',
    avatar: '🏰',
    rating: 5,
    text: 'Clean UI, clean servers, clean support. Cubiq just works. Their team even helped configure Paper optimizations for free.',
    plan: 'DIRT → DIAMOND',
  },
]

// Duplicate for seamless loop
const allTestimonials = [...testimonials, ...testimonials]

export default function TestimonialsSection() {
  const trackRef = useRef<HTMLDivElement>(null)
  const xRef = useRef(0)
  const [paused, setPaused] = useState(false)

  useAnimationFrame((_, delta) => {
    if (paused || !trackRef.current) return
    xRef.current -= delta * 0.025
    const totalW = trackRef.current.scrollWidth / 2
    if (Math.abs(xRef.current) >= totalW) xRef.current = 0
    trackRef.current.style.transform = `translateX(${xRef.current}px)`
  })

  return (
    <section className="py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-mc-grass/[0.025] to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-mc-gold/30 bg-mc-gold/5 mb-6">
            <div className="w-1.5 h-1.5 bg-mc-gold" />
            <span className="text-mc-gold text-xs font-mono uppercase tracking-widest">Player Reviews</span>
          </div>
          <h2 className="text-white mb-4" style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', lineHeight: '2.2rem' }}>
            TRUSTED BY<br />
            <span className="text-mc-gold" style={{ textShadow: '0 0 20px rgba(255,215,0,0.3)' }}>10,000+ SERVERS</span>
          </h2>
        </motion.div>
      </div>

      {/* Marquee */}
      <div
        className="relative overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Edge fades */}
        <div className="absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-mc-dark-bg to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-mc-dark-bg to-transparent pointer-events-none" />

        <div ref={trackRef} className="flex gap-4 will-change-transform" style={{ width: 'max-content' }}>
          {allTestimonials.map((t, i) => (
            <div
              key={i}
              className="mc-card p-6 w-80 flex-shrink-0 border border-mc-card-border hover:border-mc-diamond/30 transition-all duration-300 group cursor-default"
            >
              <Quote size={16} className="text-mc-card-border mb-3 group-hover:text-mc-diamond/30 transition-colors" />
              <div className="flex gap-1 mb-3">
                {Array.from({ length: t.rating }).map((_, si) => (
                  <Star key={si} size={11} className="text-mc-gold fill-mc-gold" />
                ))}
              </div>
              <p className="text-gray-400 text-sm font-body leading-relaxed mb-5 line-clamp-3">
                {t.text}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-mc-hover-bg border border-mc-card-border flex items-center justify-center text-lg pixel-art">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-white text-sm font-body font-semibold leading-tight">{t.name}</div>
                    <div className="text-gray-600 text-xs font-mono mt-0.5 leading-tight">{t.role}</div>
                  </div>
                </div>
                <div className="mc-badge text-mc-diamond border-teal-800/60 text-xs flex-shrink-0 ml-2">
                  {t.plan}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
