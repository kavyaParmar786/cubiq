'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import { Zap, Shield, Cpu, ArrowRight, Volume2, VolumeX } from 'lucide-react'
import { useRef, useState, useEffect } from 'react'

const floatingBlocks = [
  { color: 'bg-mc-grass border-mc-grass-dark', top: '18%', left: '6%', delay: 0, size: 'w-10 h-10' },
  { color: 'bg-mc-diamond border-teal-600', top: '22%', right: '8%', delay: 0.5, size: 'w-7 h-7' },
  { color: 'bg-mc-gold border-yellow-600', top: '62%', left: '4%', delay: 1, size: 'w-5 h-5' },
  { color: 'bg-mc-redstone border-red-700', top: '48%', right: '6%', delay: 0.8, size: 'w-6 h-6' },
  { color: 'bg-mc-dirt border-mc-dirt-dark', top: '72%', right: '13%', delay: 1.5, size: 'w-4 h-4' },
  { color: 'bg-mc-stone border-gray-600', top: '82%', left: '10%', delay: 0.3, size: 'w-8 h-8' },
  { color: 'bg-mc-emerald border-green-700', top: '35%', left: '2%', delay: 2, size: 'w-5 h-5' },
  { color: 'bg-purple-800 border-purple-900', top: '55%', right: '2%', delay: 1.2, size: 'w-6 h-6' },
]

const stats = [
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '< 1ms', label: 'Ping Response' },
  { value: '10K+', label: 'Servers Hosted' },
  { value: '24/7', label: 'Support' },
]

export default function HeroSection() {
  const ref = useRef<HTMLDivElement>(null)
  const [muted, setMuted] = useState(true)

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const videoOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 70])

  // Ambient audio via Web Audio API
  useEffect(() => {
    if (muted) return
    let ctx: AudioContext | null = null
    const oscs: OscillatorNode[] = []

    const start = () => {
      ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const master = ctx.createGain()
      master.gain.setValueAtTime(0, ctx.currentTime)
      master.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 2.5)
      master.connect(ctx.destination)

      // Low drone
      ;[55, 82.5, 110].forEach((freq, i) => {
        const osc = ctx!.createOscillator()
        osc.type = i === 0 ? 'sine' : 'triangle'
        osc.frequency.value = freq
        const g = ctx!.createGain()
        g.gain.value = i === 0 ? 0.5 : 0.15
        osc.connect(g).connect(master)
        osc.start()
        oscs.push(osc)
      })

      // Shimmer
      const sh = ctx.createOscillator()
      sh.type = 'sine'
      sh.frequency.value = 880
      const sg = ctx.createGain()
      sg.gain.value = 0.007
      sh.connect(sg).connect(master)
      sh.start()
      oscs.push(sh)
    }

    start()
    return () => { oscs.forEach(o => { try { o.stop() } catch {} }); ctx?.close() }
  }, [muted])

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden">

      {/* VIDEO BACKGROUND */}
      <motion.div className="absolute inset-0 z-0" style={{ opacity: videoOpacity }}>
        <video
          autoPlay loop muted playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.22 }}
        >
          <source src="/hero-bg.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-mc-dark-bg/65 via-mc-dark-bg/25 to-mc-dark-bg/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-mc-dark-bg/55 via-transparent to-mc-dark-bg/55" />
      </motion.div>

      {/* Static BG */}
      <div className="absolute inset-0 z-[1]" style={{
        background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(93,158,47,0.10) 0%, transparent 65%)',
      }} />
      <div className="absolute inset-0 z-[1] grid-bg opacity-25" />
      <div className="absolute inset-0 z-[1] pointer-events-none" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.07) 3px, rgba(0,0,0,0.07) 4px)',
      }} />

      {/* Floating Blocks */}
      {floatingBlocks.map((block, i) => (
        <motion.div
          key={i}
          className={`absolute ${block.size} ${block.color} border-2 pixel-art z-[2]`}
          style={{ top: block.top, left: block.left, right: block.right }}
          animate={{ y: [0, -14, 0], rotate: [0, 8, -8, 0] }}
          transition={{ duration: 3.5 + i * 0.4, delay: block.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* AUDIO TOGGLE */}
      <motion.button
        onClick={() => setMuted(m => !m)}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.5 }}
        className="absolute top-20 right-4 z-20 flex items-center gap-2 px-3 py-2 border border-mc-card-border bg-mc-dark-bg/80 backdrop-blur-sm text-gray-500 hover:text-mc-diamond hover:border-mc-diamond transition-all duration-200 text-xs font-mono uppercase tracking-wider"
      >
        {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
        <span className="hidden sm:inline">{muted ? 'Ambience Off' : 'Ambience On'}</span>
      </motion.button>

      {/* MAIN CONTENT */}
      <motion.div style={{ y: contentY }} className="relative z-10 max-w-5xl mx-auto px-4 text-center pt-28 pb-20">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 border border-mc-grass/40 bg-mc-grass/5 mb-8 backdrop-blur-sm"
        >
          <div className="w-2 h-2 bg-mc-emerald animate-pulse" style={{ boxShadow: '0 0 8px #00FF5A' }} />
          <span className="text-mc-emerald text-xs font-mono uppercase tracking-widest">v2.0 — Now with Instant Deploy</span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
          className="mb-6" style={{ fontFamily: "'Press Start 2P', monospace" }}
        >
          <motion.span className="block text-2xl sm:text-3xl md:text-4xl text-white leading-relaxed mb-3"
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            POWERFUL
          </motion.span>
          <motion.span className="block text-3xl sm:text-4xl md:text-5xl leading-relaxed"
            style={{ color: '#4EEBD0', textShadow: '0 0 20px rgba(78,235,208,0.6), 0 0 50px rgba(78,235,208,0.25), 0 0 100px rgba(78,235,208,0.08)' }}
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.7 }}>
            MINECRAFT
          </motion.span>
          <motion.span className="block text-xl sm:text-2xl md:text-3xl text-white leading-relaxed mt-3"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
            &amp; BOT HOSTING
          </motion.span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.45 }}
          className="text-gray-400 text-lg font-body max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Deploy your Minecraft server or Discord bot in under 60 seconds. Enterprise-grade hardware, DDoS protection, and 24/7 support — built for serious players.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.55 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
        >
          <Link href="/pricing" className="group mc-btn text-sm px-8 py-4 flex items-center gap-3 relative overflow-hidden">
            <span className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12" />
            <Zap size={16} />
            Deploy Now — From ₹99/mo
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/features" className="mc-btn-outline px-8 py-4 text-sm border-2 border-mc-card-border text-gray-300 hover:border-mc-diamond hover:text-mc-diamond transition-all duration-200 flex items-center gap-2">
            View Features
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.65 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-px bg-mc-card-border max-w-3xl mx-auto"
          style={{ boxShadow: '0 0 40px rgba(78,235,208,0.04)' }}
        >
          {stats.map(({ value, label }, i) => (
            <motion.div key={label} className="bg-mc-dark-bg/90 backdrop-blur-sm px-6 py-5 text-center group cursor-default"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 + i * 0.08 }}>
              <div className="text-mc-diamond mb-1 group-hover:text-white transition-colors"
                style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '1.1rem', textShadow: '0 0 10px rgba(78,235,208,0.4)' }}>
                {value}
              </div>
              <div className="text-gray-500 text-xs font-mono uppercase tracking-wider">{label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 1 }}
          className="mt-10 flex flex-wrap gap-6 justify-center items-center text-gray-600 text-xs font-mono"
        >
          {[
            { Icon: Shield, text: 'DDoS Protected' },
            { Icon: Cpu, text: 'NVMe SSD Storage' },
            { Icon: Zap, text: 'Instant Provisioning' },
          ].map(({ Icon, text }) => (
            <div key={text} className="flex items-center gap-2 hover:text-gray-400 transition-colors cursor-default">
              <Icon size={13} />
              {text}
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Bottom border */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <div className="h-1 pixel-divider opacity-50" />
      </div>

      {/* Scroll cue */}
      <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}>
        <span className="text-gray-700 text-xs font-mono uppercase tracking-widest">scroll</span>
        <motion.div className="w-px h-8 bg-gradient-to-b from-mc-diamond/40 to-transparent"
          animate={{ scaleY: [1, 0.4, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }} />
      </motion.div>

    </section>
  )
}
