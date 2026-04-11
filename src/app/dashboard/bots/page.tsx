'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import DashboardHeader from '@/components/layout/DashboardHeader'
import { Bot, Upload, Play, Square, RotateCcw, Terminal, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { createClient, type Bot as BotType } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'

const RUNTIMES = [
  { id: 'nodejs', label: 'Node.js 20', icon: '🟢' },
  { id: 'python', label: 'Python 3.11', icon: '🐍' },
  { id: 'go', label: 'Go 1.22', icon: '🔵' },
  { id: 'java', label: 'Java 17', icon: '☕' },
]

export default function BotsPage() {
  const { user } = useAuth()
  const [bots, setBots] = useState<BotType[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [actionId, setActionId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const [newBot, setNewBot] = useState({ name: '', runtime: 'nodejs', startCommand: 'node index.js' })
  const [consoleLogs, setConsoleLogs] = useState<Record<string, string[]>>({})
  const [expandedBot, setExpandedBot] = useState<string | null>(null)
  const supabase = createClient()

  const showToast = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3000) }

  const loadBots = useCallback(async () => {
    if (!user) return
    const { data } = await supabase.from('bots').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setBots(data || [])
    setLoading(false)
  }, [user])

  useEffect(() => { loadBots() }, [loadBots])

  const createBot = async () => {
    if (!newBot.name.trim()) return
    setCreating(true)
    try {
      const res = await fetch('/api/bots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newBot.name, runtime: newBot.runtime, startCommand: newBot.startCommand }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setBots(prev => [data.bot, ...prev])
      setShowCreate(false)
      setNewBot({ name: '', runtime: 'nodejs', startCommand: 'node index.js' })
      showToast('Bot created!')
    } catch (err: any) {
      showToast(err.message, false)
    } finally {
      setCreating(false)
    }
  }

  const powerAction = async (botId: string, action: 'start' | 'stop' | 'restart') => {
    setActionId(`${botId}-${action}`)
    try {
      const res = await fetch(`/api/bots/${botId}/power`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setBots(prev => prev.map(b => b.id === botId ? { ...b, status: data.status } : b))
      // Add to console log
      setConsoleLogs(prev => ({
        ...prev,
        [botId]: [...(prev[botId] || []), `[Cubiq] Bot ${action} signal sent`],
      }))
      showToast(`Bot ${action} sent!`)
    } catch (err: any) {
      showToast(err.message, false)
    } finally {
      setActionId(null)
    }
  }

  const deleteBot = async (botId: string) => {
    if (!confirm('Delete this bot?')) return
    setActionId(`${botId}-del`)
    const res = await fetch(`/api/bots/${botId}`, { method: 'DELETE' })
    if (res.ok) {
      setBots(prev => prev.filter(b => b.id !== botId))
      showToast('Bot deleted.')
    }
    setActionId(null)
  }

  if (loading) return (
    <div className="flex flex-col flex-1"><DashboardHeader title="Bot Hosting" />
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500 font-mono text-sm animate-pulse">Loading bots...</p>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      <DashboardHeader title="Bot Hosting" />

      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 text-sm font-body border ${toast.ok ? 'border-mc-grass/40 bg-mc-grass/10 text-mc-grass' : 'border-mc-redstone/40 bg-mc-redstone/10 text-mc-redstone'}`}>
          {toast.msg}
        </div>
      )}

      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-500 text-sm font-body">{bots.length} bot{bots.length !== 1 ? 's' : ''} deployed</p>
          <button onClick={() => setShowCreate(!showCreate)} className="mc-btn flex items-center gap-2 text-xs px-4 py-2">
            <Plus size={14} /> Deploy Bot
          </button>
        </div>

        {/* Create form */}
        {showCreate && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mc-card p-6 mb-6 border border-mc-diamond/20">
            <h3 className="text-white font-body font-bold mb-4">Deploy New Bot</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-mono text-gray-400 uppercase mb-2">Bot Name</label>
                <input type="text" value={newBot.name} onChange={e => setNewBot(p => ({ ...p, name: e.target.value }))}
                  placeholder="MyDiscordBot" className="mc-input" />
              </div>
              <div>
                <label className="block text-xs font-mono text-gray-400 uppercase mb-2">Runtime</label>
                <select value={newBot.runtime} onChange={e => setNewBot(p => ({ ...p, runtime: e.target.value }))} className="mc-input">
                  {RUNTIMES.map(r => <option key={r.id} value={r.id}>{r.icon} {r.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono text-gray-400 uppercase mb-2">Start Command</label>
                <input type="text" value={newBot.startCommand} onChange={e => setNewBot(p => ({ ...p, startCommand: e.target.value }))}
                  placeholder="node index.js" className="mc-input font-mono" />
              </div>
            </div>

            {/* File upload area */}
            <div className="border-2 border-dashed border-mc-card-border p-8 text-center mb-4 hover:border-mc-diamond/40 transition-colors cursor-pointer">
              <Upload size={28} className="text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500 text-sm font-body">Drop your bot files here or click to upload</p>
              <p className="text-gray-600 text-xs font-mono mt-1">.zip, .tar.gz · Max 100MB</p>
            </div>

            <div className="flex gap-3">
              <button onClick={createBot} disabled={!newBot.name || creating}
                className="mc-btn-diamond flex items-center gap-2 px-6 py-2 text-sm disabled:opacity-50">
                {creating ? <><RefreshCw size={14} className="animate-spin" /> Deploying...</> : <><Bot size={14} /> Deploy</>}
              </button>
              <button onClick={() => setShowCreate(false)} className="border border-mc-card-border text-gray-400 px-4 py-2 text-sm hover:text-white transition-colors">Cancel</button>
            </div>
          </motion.div>
        )}

        {/* Bot List */}
        {bots.length === 0 ? (
          <div className="mc-card p-16 text-center border border-dashed border-mc-card-border">
            <Bot size={40} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 font-body mb-4">No bots deployed yet.</p>
            <button onClick={() => setShowCreate(true)} className="mc-btn text-xs px-6 py-2">Deploy First Bot</button>
          </div>
        ) : bots.map((bot, i) => {
          const runtime = RUNTIMES.find(r => r.id === bot.runtime)
          const logs = consoleLogs[bot.id] || []
          const isExpanded = expandedBot === bot.id

          return (
            <motion.div key={bot.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }} className="mc-card p-5 mb-4">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Info */}
                <div className="flex items-center gap-4 flex-1">
                  <div className={`w-12 h-12 border-2 flex items-center justify-center flex-shrink-0 pixel-art ${bot.status === 'online' ? 'bg-mc-diamond/10 border-mc-diamond/30' : 'bg-mc-card-border border-mc-stone/20'}`}>
                    <Bot size={22} className={bot.status === 'online' ? 'text-mc-diamond' : 'text-gray-500'} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-white font-body font-bold">{bot.name}</h3>
                      <div className={`status-${bot.status}`}>{bot.status}</div>
                    </div>
                    <div className="text-xs font-mono text-gray-500 flex flex-wrap gap-4">
                      <span>{runtime?.icon} {runtime?.label || bot.runtime}</span>
                      <span className="font-mono text-gray-600">$ {bot.start_command}</span>
                      <span>💾 {bot.ram}MB · 🖥️ {bot.cpu}%</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 items-center">
                  <button onClick={() => setExpandedBot(isExpanded ? null : bot.id)}
                    className="px-3 py-2 border border-mc-card-border text-gray-400 hover:text-mc-diamond text-xs uppercase flex items-center gap-1 transition-all">
                    <Terminal size={12} /> {isExpanded ? 'Hide' : 'Console'}
                  </button>
                  {bot.status === 'online' ? (
                    <>
                      <button onClick={() => powerAction(bot.id, 'restart')} disabled={!!actionId}
                        className="px-3 py-2 border border-mc-gold/40 text-mc-gold hover:bg-mc-gold/10 text-xs uppercase flex items-center gap-1 transition-all disabled:opacity-50">
                        <RotateCcw size={12} className={actionId === `${bot.id}-restart` ? 'animate-spin' : ''} /> Restart
                      </button>
                      <button onClick={() => powerAction(bot.id, 'stop')} disabled={!!actionId}
                        className="px-3 py-2 border border-mc-redstone/40 text-mc-redstone hover:bg-mc-redstone/10 text-xs uppercase flex items-center gap-1 transition-all disabled:opacity-50">
                        <Square size={12} /> Stop
                      </button>
                    </>
                  ) : (
                    <button onClick={() => powerAction(bot.id, 'start')} disabled={!!actionId}
                      className="px-3 py-2 border border-mc-grass/40 text-mc-grass hover:bg-mc-grass/10 text-xs uppercase flex items-center gap-1 transition-all disabled:opacity-50">
                      {actionId === `${bot.id}-start` ? <RefreshCw size={12} className="animate-spin" /> : <Play size={12} />} Start
                    </button>
                  )}
                  <button onClick={() => deleteBot(bot.id)} disabled={!!actionId}
                    className="p-2 text-gray-500 hover:text-mc-redstone transition-colors border border-transparent hover:border-mc-redstone/30">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Inline Console */}
              {isExpanded && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4">
                  <div className="mc-console h-32 overflow-y-auto">
                    {logs.length === 0 ? (
                      <div className="text-gray-600 text-xs p-2">No output yet. Start the bot to see logs.</div>
                    ) : logs.map((line, li) => (
                      <div key={li} className="mc-console-line info">{line}</div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
