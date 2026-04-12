'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Check, Zap, Star, Bot, Server } from 'lucide-react'
import { createClient, type Plan } from '@/lib/supabase'

const PLAN_ICONS: Record<string, string> = {
  dirt: '🪨', iron: '⚙️', diamond: '💎',
  emerald: '🌿', netherite: '⚔️',
  'bot-starter': '🤖', 'bot-pro': '⚡', 'bot-ultra': '🚀',
}

const PLAN_ACCENTS: Record<string, string> = {
  dirt: 'text-mc-stone border-gray-700',
  iron: 'text-gray-300 border-gray-600',
  diamond: 'text-mc-diamond border-teal-800',
  emerald: 'text-mc-emerald border-green-800',
  netherite: 'text-mc-gold border-yellow-800',
  'bot-starter': 'text-mc-stone border-gray-700',
  'bot-pro': 'text-mc-diamond border-teal-800',
  'bot-ultra': 'text-mc-gold border-yellow-800',
}

const BORDER_COLORS: Record<string, string> = {
  dirt: 'border-mc-card-border',
  iron: 'border-gray-600/30',
  diamond: 'border-mc-diamond',
  emerald: 'border-mc-emerald/40',
  netherite: 'border-mc-gold',
  'bot-starter': 'border-mc-card-border',
  'bot-pro': 'border-mc-diamond',
  'bot-ultra': 'border-mc-gold',
}

function PlanCard({ plan, delay }: { plan: Plan; delay: number }) {
  const icon = PLAN_ICONS[plan.name] || '📦'
  const accent = PLAN_ACCENTS[plan.name] || 'text-mc-stone border-gray-700'
  const border = BORDER_COLORS[plan.name] || 'border-mc-card-border'
  const ramGB = Math.round(plan.ram / 1024)
  const cpuCores = plan.cpu / 100
  const diskGB = Math.round(plan.disk / 1024)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`mc-card p-6 relative border-2 ${border} flex flex-col ${plan.is_featured ? 'ring-1 ring-mc-diamond/30' : ''}`}
    >
      {plan.is_featured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-mc-diamond text-mc-obsidian px-3 py-0.5 text-xs font-mono font-bold flex items-center gap-1 whitespace-nowrap">
          <Star size={9} fill="currentColor" /> POPULAR
        </div>
      )}

      <div className="text-3xl mb-3">{icon}</div>
      <h3 className={`font-minecraft text-xs mb-4 ${accent.split(' ')[0]}`} style={{ fontFamily: "'Press Start 2P', monospace" }}>
        {plan.display_name}
      </h3>
      <div className="mb-4">
        <span className="text-3xl font-bold text-white font-body">₹{plan.price}</span>
        <span className="text-gray-500 text-xs font-mono">/mo</span>
      </div>

      {/* Specs grid */}
      <div className="bg-mc-dark-bg border border-mc-card-border p-3 mb-5 text-xs font-mono grid grid-cols-2 gap-x-2 gap-y-1.5">
        <div><span className="text-gray-600">RAM</span><span className={`block ${accent.split(' ')[0]}`}>{ramGB}GB</span></div>
        <div><span className="text-gray-600">CPU</span><span className="block text-white">{cpuCores} vCore{cpuCores > 1 ? 's' : ''}</span></div>
        <div><span className="text-gray-600">Disk</span><span className="block text-white">{diskGB}GB</span></div>
        <div><span className="text-gray-600">BW</span><span className="block text-white">{plan.bandwidth}</span></div>
        {plan.type === 'minecraft' && (
          <>
            <div><span className="text-gray-600">Players</span><span className="block text-mc-emerald">{plan.max_players >= 999 ? 'Unlimited' : plan.max_players}</span></div>
            <div><span className="text-gray-600">Backups</span><span className="block text-white">{plan.backups}</span></div>
          </>
        )}
      </div>

      {/* Features */}
      <ul className="space-y-1.5 mb-6 flex-1">
        {(plan.features || []).map((f) => (
          <li key={f} className="flex items-start gap-2 text-xs font-body text-gray-400">
            <Check size={12} className="text-mc-emerald mt-0.5 flex-shrink-0" /> {f}
          </li>
        ))}
      </ul>

      <Link
        href="/register"
        className={`flex items-center justify-center gap-2 py-2.5 text-xs uppercase tracking-wider font-body transition-all ${
          plan.is_featured
            ? 'mc-btn-diamond'
            : 'border border-mc-card-border text-gray-400 hover:border-mc-diamond hover:text-mc-diamond'
        }`}
      >
        <Zap size={12} /> Get Started
      </Link>
    </motion.div>
  )
}

export default function PricingContent() {
  const [tab, setTab] = useState<'minecraft' | 'bots'>('minecraft')
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase
      .from('plans')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
      .then(({ data }) => {
        setPlans(data || [])
        setLoading(false)
      })
  }, [])

  const mcPlans = plans.filter(p => p.type === 'minecraft')
  const botPlans = plans.filter(p => p.type === 'bot')
  const shown = tab === 'minecraft' ? mcPlans : botPlans

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
        <div className="flex justify-center mt-8">
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
              className={`flex items-center gap-2 px-6 py-3 text-sm font-body uppercase tracking-wider transition-all border-l border-mc-card-border ${
                tab === 'bots' ? 'bg-mc-grass text-white' : 'text-gray-500 hover:text-white'
              }`}
            >
              <Bot size={14} /> Discord Bots
            </button>
          </div>
        </div>
      </div>

      {/* Plans */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="mc-card border border-mc-card-border h-96 animate-pulse" />
          ))}
        </div>
      ) : shown.length === 0 ? (
        <div className="text-center py-16 text-gray-500 font-mono">
          No plans configured yet.{' '}
          <Link href="/admin/plans" className="text-mc-diamond hover:underline">Add plans in admin →</Link>
        </div>
      ) : (
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`grid grid-cols-1 gap-4 ${
            shown.length <= 3
              ? 'sm:grid-cols-3 max-w-4xl mx-auto'
              : shown.length === 4
              ? 'sm:grid-cols-2 lg:grid-cols-4'
              : 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'
          }`}
        >
          {shown.map((plan, i) => (
            <PlanCard key={plan.id} plan={plan} delay={i * 0.07} />
          ))}
        </motion.div>
      )}

      <div className="text-center mt-10 text-gray-500 text-sm font-body">
        All prices in INR · GST applicable at checkout ·{' '}
        <Link href="/#faq" className="text-mc-diamond hover:underline">FAQ</Link>
      </div>
    </div>
  )
}
