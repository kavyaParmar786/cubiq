'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import DashboardHeader from '@/components/layout/DashboardHeader'
import { Check, ChevronRight, Zap } from 'lucide-react'
import { createClient, type Plan } from '@/lib/supabase'

const SERVER_TYPES = [
  { id: 'paper', name: 'Paper', icon: '📄', desc: 'Best for plugins. Highly optimized.' },
  { id: 'vanilla', name: 'Vanilla', icon: '🌿', desc: 'Pure Minecraft experience.' },
  { id: 'forge', name: 'Forge', icon: '⚙️', desc: 'Mod support with Forge.' },
  { id: 'fabric', name: 'Fabric', icon: '🧵', desc: 'Lightweight mod loader.' },
  { id: 'spigot', name: 'Spigot', icon: '💧', desc: 'Classic plugin server.' },
  { id: 'bungeecord', name: 'BungeeCord', icon: '🔗', desc: 'Network proxy.' },
]
const VERSIONS = ['1.20.4', '1.20.1', '1.19.4', '1.18.2', '1.16.5', '1.12.2', '1.8.9']

const DEPLOY_MSGS = [
  'Allocating resources...',
  'Configuring node assignment...',
  'Installing server software...',
  'Applying your settings...',
  'Server is almost ready...',
]

export default function CreateServerPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [plans, setPlans] = useState<Plan[]>([])
  const [plansLoading, setPlansLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [deployMsg, setDeployMsg] = useState(DEPLOY_MSGS[0])
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', type: 'paper', version: '1.20.4', planId: '' })
  const supabase = createClient()

  useEffect(() => {
    supabase.from('plans').select('*').eq('type', 'minecraft').eq('is_active', true).order('sort_order')
      .then(({ data }) => {
        setPlans(data || [])
        if (data?.length) setForm(p => ({ ...p, planId: data.find(pl => pl.is_featured)?.id || data[0].id }))
        setPlansLoading(false)
      })
  }, [])

  const selectedPlan = plans.find(p => p.id === form.planId)

  const handleCreate = async () => {
    setCreating(true)
    setError('')

    // Cycle through deploy messages
    let msgIdx = 0
    const msgInterval = setInterval(() => {
      msgIdx = (msgIdx + 1) % DEPLOY_MSGS.length
      setDeployMsg(DEPLOY_MSGS[msgIdx])
    }, 1500)

    try {
      const res = await fetch('/api/servers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, type: form.type, version: form.version, planId: form.planId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      clearInterval(msgInterval)
      setCreating(false)
      setDone(true)
      setTimeout(() => router.push(`/dashboard/servers/${data.server.id}`), 2000)
    } catch (err: any) {
      clearInterval(msgInterval)
      setCreating(false)
      setError(err.message)
    }
  }

  const steps = ['Type & Name', 'Version & Plan', 'Confirm']

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      <DashboardHeader title="Create Server" />
      <div className="p-6 max-w-2xl mx-auto w-full">
        {/* Step indicator */}
        <div className="flex items-center gap-0 mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={`flex items-center gap-2 px-3 py-2 text-xs font-mono uppercase transition-all ${step === i + 1 ? 'text-mc-diamond' : step > i + 1 ? 'text-mc-grass' : 'text-gray-600'}`}>
                <div className={`w-5 h-5 flex items-center justify-center border text-xs font-bold ${step > i + 1 ? 'bg-mc-grass border-mc-grass-dark text-white' : step === i + 1 ? 'border-mc-diamond text-mc-diamond' : 'border-gray-700 text-gray-600'}`}>
                  {step > i + 1 ? <Check size={10} /> : i + 1}
                </div>
                {s}
              </div>
              {i < steps.length - 1 && <ChevronRight size={14} className="text-gray-700" />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1 */}
          {step === 1 && !creating && !done && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="mb-6">
                <label className="block text-xs font-mono text-gray-400 uppercase tracking-wider mb-2">Server Name</label>
                <input type="text" placeholder="MySurvivalSMP" value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value.replace(/[^a-zA-Z0-9_-]/g, '') }))}
                  className="mc-input" maxLength={32} />
                <p className="text-gray-600 text-xs font-mono mt-1">Letters, numbers, underscores and hyphens only.</p>
              </div>
              <div>
                <label className="block text-xs font-mono text-gray-400 uppercase tracking-wider mb-3">Server Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {SERVER_TYPES.map(t => (
                    <button key={t.id} onClick={() => setForm(p => ({ ...p, type: t.id }))}
                      className={`p-4 border-2 text-left transition-all hover:border-mc-diamond/40 ${form.type === t.id ? 'border-mc-diamond bg-mc-diamond/5' : 'border-mc-card-border'}`}>
                      <div className="text-2xl mb-1">{t.icon}</div>
                      <div className="text-white font-body font-semibold text-sm">{t.name}</div>
                      <div className="text-gray-500 text-xs">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end mt-8">
                <button onClick={() => setStep(2)} disabled={!form.name.trim()}
                  className="mc-btn px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed">Next →</button>
              </div>
            </motion.div>
          )}

          {/* Step 2 */}
          {step === 2 && !creating && !done && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="mb-6">
                <label className="block text-xs font-mono text-gray-400 uppercase tracking-wider mb-3">Minecraft Version</label>
                <div className="grid grid-cols-4 gap-2">
                  {VERSIONS.map(v => (
                    <button key={v} onClick={() => setForm(p => ({ ...p, version: v }))}
                      className={`py-2 px-3 text-xs font-mono border-2 transition-all ${form.version === v ? 'border-mc-diamond text-mc-diamond bg-mc-diamond/5' : 'border-mc-card-border text-gray-400 hover:border-mc-stone/40'}`}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono text-gray-400 uppercase tracking-wider mb-3">Hosting Plan</label>
                {plansLoading ? (
                  <p className="text-gray-500 text-sm font-mono animate-pulse">Loading plans...</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {plans.map(plan => (
                      <button key={plan.id} onClick={() => setForm(p => ({ ...p, planId: plan.id }))}
                        className={`p-4 border-2 flex items-center justify-between transition-all ${form.planId === plan.id ? 'border-mc-diamond bg-mc-diamond/5' : 'border-mc-card-border hover:border-mc-stone/40'}`}>
                        <div className="flex items-center gap-3 text-left">
                          {plan.is_featured && <span className="mc-badge text-mc-diamond border-teal-800 text-xs">POPULAR</span>}
                          <span className="text-white font-body font-bold text-sm">{plan.display_name}</span>
                          <span className="text-xs font-mono text-gray-500">
                            {Math.round(plan.ram / 1024)}GB RAM · {plan.cpu / 100} vCore{plan.cpu > 100 ? 's' : ''} · {Math.round(plan.disk / 1024)}GB
                          </span>
                        </div>
                        <span className="text-white font-body font-bold whitespace-nowrap">₹{plan.price}<span className="text-gray-500 font-normal text-xs">/mo</span></span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-between mt-8">
                <button onClick={() => setStep(1)} className="border border-mc-card-border text-gray-400 hover:text-white px-6 py-3 text-sm transition-all">← Back</button>
                <button onClick={() => setStep(3)} disabled={!form.planId}
                  className="mc-btn px-8 py-3 disabled:opacity-50">Next →</button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && !creating && !done && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="mc-card p-6 border border-mc-diamond/20 mb-6">
                <h3 className="text-white font-body font-bold mb-4">Order Summary</h3>
                <div className="space-y-3 text-sm font-body">
                  {[
                    ['Server Name', form.name],
                    ['Server Type', SERVER_TYPES.find(t => t.id === form.type)?.name || form.type],
                    ['Version', form.version],
                    ['Plan', selectedPlan?.display_name || ''],
                    ['RAM', selectedPlan ? `${Math.round(selectedPlan.ram / 1024)}GB` : ''],
                    ['CPU', selectedPlan ? `${selectedPlan.cpu / 100} vCore${selectedPlan.cpu > 100 ? 's' : ''}` : ''],
                    ['Monthly Price', `₹${selectedPlan?.price || 0}`],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between py-2 border-b border-mc-card-border last:border-0">
                      <span className="text-gray-500">{k}</span>
                      <span className="text-white font-medium">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              {error && (
                <div className="mb-4 px-4 py-3 border border-mc-redstone/40 bg-mc-redstone/10 text-mc-redstone text-sm font-body">{error}</div>
              )}
              <div className="flex justify-between">
                <button onClick={() => setStep(2)} className="border border-mc-card-border text-gray-400 hover:text-white px-6 py-3 text-sm transition-all">← Back</button>
                <button onClick={handleCreate} className="mc-btn-diamond px-10 py-3 flex items-center gap-2">
                  <Zap size={16} /> Deploy Server
                </button>
              </div>
            </motion.div>
          )}

          {/* Deploying */}
          {creating && (
            <motion.div key="deploying" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
              <div className="text-5xl mb-6 animate-bounce">⚡</div>
              <h3 className="text-white mb-3" style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '1rem' }}>
                GENERATING WORLD...
              </h3>
              <p className="text-mc-diamond font-mono text-sm animate-pulse">{deployMsg}</p>
              <div className="mt-6 mc-progress max-w-xs mx-auto">
                <motion.div className="mc-progress-bar" initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 8, ease: 'linear' }} />
              </div>
            </motion.div>
          )}

          {/* Done */}
          {done && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16">
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-mc-emerald mb-2" style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '1rem' }}>SERVER READY!</h3>
              <p className="text-gray-400 font-body">Redirecting to your server...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
