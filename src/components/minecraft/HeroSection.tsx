'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Zap, Shield, HardDrive, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase'

// ── Minecraft block colors ────────────────────────────────────
const BLOCK_COLORS = [
  '#5D9E2F', '#4A7A24', // grass
  '#6B4226', '#4A2E1A', // dirt
  '#8B8B8B', '#5A5A5A', // stone
  '#4EEBD0', '#2BBFA6', // diamond
  '#FFD700', '#C8A800', // gold
  '#FF3333', '#CC0000', // redstone
]

// ── Falling blocks canvas background ─────────────────────────
function MinecraftCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Create blocks
    const blocks = Array.from({ length: 28 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      size: 8 + Math.random() * 20,
      speed: 0.3 + Math.random() * 0.8,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.02,
      color: BLOCK_COLORS[Math.floor(Math.random() * BLOCK_COLORS.length)],
      alpha: 0.06 + Math.random() * 0.1,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      blocks.forEach(b => {
        b.y += b.speed
        b.rotation += b.rotSpeed
        if (b.y > canvas.height + 40) {
          b.y = -40
          b.x = Math.random() * canvas.width
        }

        ctx.save()
        ctx.translate(b.x + b.size / 2, b.y + b.size / 2)
        ctx.rotate(b.rotation)
        ctx.globalAlpha = b.alpha
        ctx.fillStyle = b.color
        ctx.fillRect(-b.size / 2, -b.size / 2, b.size, b.size)
        // Pixel highlight
        ctx.fillStyle = 'rgba(255,255,255,0.3)'
        ctx.fillRect(-b.size / 2, -b.size / 2, b.size * 0.4, b.size * 0.2)
        ctx.restore()
      })

      animId = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  )
}

// ── Static stats fallback, replaced by real data ─────────────
const FALLBACK_STATS = [
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '<1ms', label: 'Response' },
  { value: '—', label: 'Servers' },
  { value: '24/7', label: 'Support' },
]

export default function HeroSection() {
  const [stats, setStats] = useState(FALLBACK_STATS)
  const [lowestPrice, setLowestPrice] = useState<number | null>(null)
  const supabase = createClient()

  useEffect(() => {
    // Fetch real server count + lowest plan price
    Promise.all([
      supabase.from('servers').select('id', { count: 'exact', head: true } as any).neq('status', 'deleted'),
      supabase.from('plans').select('price').eq('is_active', true).order('price').limit(1),
    ]).then(([serversRes, plansRes]) => {
      const serverCount = (serversRes as any).count || 0
      const price = plansRes.data?.[0]?.price || null

      setStats([
        { value: '99.9%', label: 'Uptime SLA' },
        { value: '<1ms', label: 'Response' },
        { value: serverCount > 0 ? `${serverCount}+` : '10K+', label: 'Servers' },
        { value: '24/7', label: 'Support' },
      ])
      if (price) setLowestPrice(price)
    }).catch(() => {}) // Keep fallback on error
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">

      {/* ── Layered backgrounds ── */}
      {/* Base dark */}
      <div className="absolute inset-0 bg-mc-dark-bg" />

      {/* Animated falling blocks canvas */}
      <MinecraftCanvas />

      {/* Radial gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(93,158,47,0.08) 0%, rgba(78,235,208,0.05) 40%, transparent 70%)',
        }}
      />

      {/* Grid lines */}
      <div className="absolute inset-0 grid-bg opacity-25" />

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, #0D0D14)' }}
      />

      {/* Scanlines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,1) 2px, rgba(0,0,0,1) 4px)' }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center pt-28 pb-20">

        {/* Live badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 border border-mc-grass/40 bg-mc-grass/10 mb-8"
        >
          <span
            className="w-2 h-2 rounded-full bg-mc-emerald"
            style={{ boxShadow: '0 0 6px #00FF5A', animation: 'pulse 2s infinite' }}
          />
          <span className="text-mc-emerald text-xs font-mono uppercase tracking-widest">
            v2.0 — Supabase + Pterodactyl Powered
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
          <span className="block text-2xl sm:text-3xl text-white leading-relaxed mb-4">
            POWERFUL
          </span>
          <span
            className="block text-3xl sm:text-4xl md:text-5xl leading-relaxed"
            style={{
              color: '#4EEBD0',
              textShadow: '0 0 20px rgba(78,235,208,0.6), 0 0 40px rgba(78,235,208,0.3)',
            }}
          >
            MINECRAFT
          </span>
          <span className="block text-2xl sm:text-3xl text-white leading-relaxed mt-2">
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
          Deploy your Minecraft server or Discord bot in under 60 seconds.
          Enterprise hardware, DDoS protection, 24/7 support.
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
            Deploy Now{lowestPrice ? ` — From ₹${lowestPrice}/mo` : ''}
            <ArrowRight size={14} />
          </Link>
          <Link
            href="/features"
            className="px-8 py-4 text-sm border-2 border-mc-card-border text-gray-300 hover:border-mc-diamond hover:text-mc-diamond transition-all duration-200 flex items-center gap-2 font-body uppercase tracking-wider"
          >
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
              <div
                className="text-mc-diamond mb-1"
                style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '1.1rem' }}
              >
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
          className="mt-10 flex flex-wrap gap-6 justify-center items-center text-gray-600 text-xs font-mono"
        >
          {[
            { Icon: Shield, text: 'DDoS Protected' },
            { Icon: HardDrive, text: 'NVMe SSD Storage' },
            { Icon: Zap, text: 'Instant Deploy' },
          ].map(({ Icon, text }) => (
            <div key={text} className="flex items-center gap-2">
              <Icon size={13} className="text-gray-500" />
              {text}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom grass border */}
      <div className="absolute bottom-0 left-0 right-0 h-3 pixel-divider opacity-50" />
    </section>
  )
}
