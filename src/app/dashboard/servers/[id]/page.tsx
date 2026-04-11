'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import DashboardHeader from '@/components/layout/DashboardHeader'
import { Play, Square, RotateCcw, Terminal, FolderOpen, Package, Cpu, MemoryStick, Clock, RefreshCw, Copy } from 'lucide-react'
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts'
import { createClient, type Server } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'

const MODPACKS = [
  { id: 'vanilla', name: 'Vanilla', icon: '🌿', desc: 'Clean Minecraft' },
  { id: 'paper', name: 'Paper', icon: '📄', desc: 'Optimized Spigot' },
  { id: 'forge', name: 'Forge', icon: '⚙️', desc: 'Mod loader' },
  { id: 'fabric', name: 'Fabric', icon: '🧵', desc: 'Lightweight mods' },
  { id: 'rlcraft', name: 'RLCraft', icon: '🐉', desc: 'Hardcore survival' },
  { id: 'skyfactory4', name: 'SkyFactory 4', icon: '🌤️', desc: 'Skyblock + mods' },
  { id: 'create', name: 'Create', icon: '⚙', desc: 'Automation mod' },
  { id: 'atm9', name: 'ATM9', icon: '✨', desc: 'All the Mods 9' },
]

interface LogLine { type: string; msg: string; ts: string }
interface LiveStats { cpu: number; ram: number; ramMax: number; disk: number; diskMax: number; uptime: number; state: string }

export default function ServerDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const router = useRouter()
  const [server, setServer] = useState<Server | null>(null)
  const [liveStats, setLiveStats] = useState<LiveStats | null>(null)
  const [cpuHistory, setCpuHistory] = useState<{ t: number; v: number }[]>([])
  const [ramHistory, setRamHistory] = useState<{ t: number; v: number }[]>([])
  const [activeTab, setActiveTab] = useState<'console' | 'files' | 'modpacks'>('console')
  const [logs, setLogs] = useState<LogLine[]>([])
  const [command, setCommand] = useState('')
  const [cmdLoading, setCmdLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [installingMod, setInstallingMod] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const [loading, setLoading] = useState(true)
  const consoleEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const showToast = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3000) }

  const addLog = (type: string, msg: string) => {
    setLogs(prev => [...prev.slice(-200), { type, msg, ts: new Date().toLocaleTimeString() }])
  }

  // Load server
  useEffect(() => {
    if (!user) return
    supabase.from('servers')
      .select('*, plans(*), nodes(name, location_city, location_flag, ip)')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) { router.push('/dashboard/servers'); return }
        setServer(data as Server)
        addLog('info', `[Cubiq] Connected to ${data.name}`)
        addLog('info', `[Cubiq] Status: ${data.status}`)
        setLoading(false)
      })
  }, [user, params.id])

  // Poll live stats
  useEffect(() => {
    if (!server || !['online', 'starting'].includes(server.status)) return
    const poll = async () => {
      try {
        const res = await fetch(`/api/servers/${params.id}/stats`)
        if (!res.ok) return
        const d = await res.json()
        setLiveStats(d)
        setCpuHistory(prev => [...prev.slice(-29), { t: Date.now(), v: d.cpu }])
        setRamHistory(prev => [...prev.slice(-29), { t: Date.now(), v: Math.round(d.ram) }])
      } catch {}
    }
    poll()
    const iv = setInterval(poll, 4000)
    return () => clearInterval(iv)
  }, [server?.id, server?.status])

  // Auto scroll console
  useEffect(() => { consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [logs])

  const handlePower = async (action: 'start' | 'stop' | 'restart') => {
    if (!server) return
    setActionLoading(action)
    addLog('warn', `[Cubiq] Sending ${action} signal...`)
    try {
      const res = await fetch(`/api/servers/${params.id}/power`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setServer(prev => prev ? { ...prev, status: data.status } : prev)
      addLog('success', `[Cubiq] ${action} signal accepted. Status: ${data.status}`)
      showToast(`Server ${action} sent!`)
    } catch (err: any) {
      addLog('error', `[Cubiq] Error: ${err.message}`)
      showToast(err.message, false)
    } finally {
      setActionLoading(null)
    }
  }

  const sendCommand = async () => {
    if (!command.trim() || cmdLoading) return
    const cmd = command.trim()
    setCommand('')
    setCmdLoading(true)
    addLog('default', `> ${cmd}`)
    try {
      const res = await fetch(`/api/servers/${params.id}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
      addLog('info', `[Server] Command sent: ${cmd}`)
    } catch (err: any) {
      addLog('error', `[Error] ${err.message}`)
    } finally {
      setCmdLoading(false)
    }
  }

  const installModpack = async (modpackId: string) => {
    setInstallingMod(modpackId)
    addLog('warn', `[Installer] Installing ${modpackId}... This will reset server files!`)
    try {
      const res = await fetch(`/api/servers/${params.id}/modpack`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modpackId }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error)
      addLog('success', `[Installer] ${modpackId} installation started!`)
      showToast(`Installing ${modpackId}...`)
    } catch (err: any) {
      addLog('error', `[Installer] Error: ${err.message}`)
      showToast(err.message, false)
    } finally {
      setInstallingMod(null)
    }
  }

  const formatUptime = (ms: number) => {
    if (!ms) return '—'
    const d = Math.floor(ms / 86400000); const h = Math.floor((ms % 86400000) / 3600000)
    const m = Math.floor((ms % 3600000) / 60000)
    return d > 0 ? `${d}d ${h}h ${m}m` : h > 0 ? `${h}h ${m}m` : `${m}m`
  }

  const copyIP = () => {
    if (server?.connection_ip) {
      navigator.clipboard.writeText(`${server.connection_ip}:${server.connection_port}`)
      showToast('IP copied!')
    }
  }

  if (loading) return (
    <div className="flex flex-col flex-1"><DashboardHeader title="Server" />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center"><div className="text-4xl mb-4">⚙️</div>
          <p className="text-gray-500 font-mono text-xs animate-pulse">Loading server data...</p>
        </div>
      </div>
    </div>
  )
  if (!server) return null

  const node = (server as any).nodes
  const plan = (server as any).plans
  const status = liveStats?.state || server.status

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      <DashboardHeader title={server.name} />

      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 text-sm font-body border ${toast.ok ? 'border-mc-grass/40 bg-mc-grass/10 text-mc-grass' : 'border-mc-redstone/40 bg-mc-redstone/10 text-mc-redstone'}`}>
          {toast.msg}
        </div>
      )}

      <div className="p-6 flex flex-col gap-6">
        {/* Info bar */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mc-card p-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className={`status-${status}`}>{status}</div>
              <span className="text-sm font-mono text-gray-500">{server.type} {server.version}</span>
              {node && <span className="text-xs font-mono text-gray-600">{node.location_flag} {node.location_city}</span>}
              {server.connection_ip && (
                <button onClick={copyIP} className="flex items-center gap-1 text-xs font-mono text-gray-400 hover:text-mc-diamond transition-colors">
                  {server.connection_ip}:{server.connection_port} <Copy size={10} />
                </button>
              )}
              {plan && <span className="mc-badge text-mc-diamond border-teal-800 text-xs">{plan.display_name}</span>}
            </div>
            <div className="flex gap-2">
              {(status === 'running' || status === 'online' || status === 'starting') ? (
                <>
                  <button onClick={() => handlePower('restart')} disabled={!!actionLoading}
                    className="px-3 py-2 border border-mc-gold/40 text-mc-gold hover:bg-mc-gold/10 text-xs uppercase flex items-center gap-1 transition-all disabled:opacity-50">
                    <RotateCcw size={12} className={actionLoading === 'restart' ? 'animate-spin' : ''} /> Restart
                  </button>
                  <button onClick={() => handlePower('stop')} disabled={!!actionLoading}
                    className="px-3 py-2 border border-mc-redstone/40 text-mc-redstone hover:bg-mc-redstone/10 text-xs uppercase flex items-center gap-1 transition-all disabled:opacity-50">
                    <Square size={12} /> Stop
                  </button>
                </>
              ) : (
                <button onClick={() => handlePower('start')} disabled={!!actionLoading || status === 'suspended'}
                  className="px-3 py-2 border border-mc-grass/40 text-mc-grass hover:bg-mc-grass/10 text-xs uppercase flex items-center gap-1 transition-all disabled:opacity-50">
                  {actionLoading === 'start' ? <RefreshCw size={12} className="animate-spin" /> : <Play size={12} />} Start
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Cpu, label: 'CPU', value: liveStats ? `${liveStats.cpu.toFixed(1)}%` : '—', chart: cpuHistory, color: '#4EEBD0' },
            { icon: MemoryStick, label: 'RAM', value: liveStats ? `${liveStats.ram}/${liveStats.ramMax}MB` : `—/${server.ram}MB`, chart: ramHistory, color: '#FFD700' },
            { icon: Clock, label: 'Uptime', value: liveStats ? formatUptime(liveStats.uptime) : '—', chart: null, color: '#8B8B8B' },
            { icon: RefreshCw, label: 'Disk', value: liveStats ? `${liveStats.disk}MB` : '—', chart: null, color: '#A78BFA' },
          ].map(({ icon: Icon, label, value, chart, color }) => (
            <motion.div key={label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mc-card p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-xs font-mono text-gray-500 uppercase">
                  <Icon size={12} style={{ color }} /> {label}
                </div>
                <span className="text-white font-body font-bold text-sm">{value}</span>
              </div>
              {chart && chart.length > 1 && (
                <ResponsiveContainer width="100%" height={40}>
                  <LineChart data={chart}>
                    <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="border-b border-mc-card-border flex">
          {[
            { id: 'console', label: 'Console', icon: Terminal },
            { id: 'files', label: 'Files', icon: FolderOpen },
            { id: 'modpacks', label: 'Modpacks', icon: Package },
          ].map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-body uppercase tracking-wider transition-all border-b-2 -mb-px ${activeTab === id ? 'text-mc-diamond border-mc-diamond' : 'text-gray-500 border-transparent hover:text-white'}`}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {/* Console */}
        {activeTab === 'console' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mc-card border border-mc-card-border">
            <div className="mc-console h-80 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="p-4 text-gray-600 text-xs font-mono">Waiting for server output...</div>
              ) : logs.map((log, i) => (
                <div key={i} className={`mc-console-line ${log.type}`}>
                  <span className="text-gray-700 mr-2 select-none text-xs">{log.ts}</span>
                  {log.msg}
                </div>
              ))}
              <div ref={consoleEndRef} />
            </div>
            <div className="flex border-t border-mc-card-border">
              <span className="px-3 flex items-center text-mc-grass text-xs font-mono border-r border-mc-card-border select-none">&gt;</span>
              <input type="text" value={command}
                onChange={e => setCommand(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendCommand()}
                placeholder={status === 'online' || status === 'running' ? 'Type a command and press Enter...' : 'Server must be online to send commands'}
                disabled={!['online', 'running'].includes(status)}
                className="flex-1 bg-transparent px-4 py-3 text-sm font-mono text-white focus:outline-none placeholder-gray-600 disabled:opacity-40" />
              <button onClick={sendCommand} disabled={cmdLoading || !['online', 'running'].includes(status)}
                className="px-4 text-mc-diamond hover:bg-mc-hover-bg transition-colors text-xs font-mono border-l border-mc-card-border disabled:opacity-40">
                {cmdLoading ? '...' : 'SEND'}
              </button>
            </div>
          </motion.div>
        )}

        {/* Files */}
        {activeTab === 'files' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mc-card border border-mc-card-border">
            <div className="px-4 py-3 border-b border-mc-card-border text-xs font-mono text-gray-500 flex items-center justify-between">
              <span>📁 /home/container/</span>
              <span className="text-mc-diamond text-xs">SFTP: {server.connection_ip}:2022</span>
            </div>
            <div className="divide-y divide-mc-card-border">
              {[
                { name: 'world/', type: 'dir', size: '—' },
                { name: 'plugins/', type: 'dir', size: '—' },
                { name: 'logs/', type: 'dir', size: '—' },
                { name: 'server.properties', type: 'file', size: '~2KB' },
                { name: `${server.type}.jar`, type: 'file', size: '~40MB' },
                { name: 'eula.txt', type: 'file', size: '~0.2KB' },
              ].map(f => (
                <div key={f.name} className="flex items-center justify-between px-4 py-3 hover:bg-mc-hover-bg cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <span>{f.type === 'dir' ? '📁' : '📄'}</span>
                    <span className="text-sm font-mono text-gray-300">{f.name}</span>
                  </div>
                  <span className="text-xs font-mono text-gray-600">{f.size}</span>
                </div>
              ))}
            </div>
            <div className="px-4 py-3 border-t border-mc-card-border">
              <p className="text-gray-600 text-xs font-mono">💡 Use SFTP for full file access. Connect to {server.connection_ip}:2022 with your Cubiq credentials.</p>
            </div>
          </motion.div>
        )}

        {/* Modpacks */}
        {activeTab === 'modpacks' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mc-card p-4 border border-mc-gold/20 bg-mc-gold/5 mb-4">
              <p className="text-mc-gold text-sm font-body">⚠️ Installing a modpack will <strong>reinstall your server</strong> — all files will be reset. Stop and backup first.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {MODPACKS.map(mod => (
                <div key={mod.id} className={`mc-card p-4 flex flex-col items-center text-center gap-2 border transition-all ${server.modpack === mod.id ? 'border-mc-diamond bg-mc-diamond/5' : 'border-mc-card-border hover:border-mc-diamond/30'}`}>
                  <div className="text-3xl">{mod.icon}</div>
                  <div className="text-white font-body font-semibold text-sm">{mod.name}</div>
                  <div className="text-gray-500 text-xs">{mod.desc}</div>
                  {server.modpack === mod.id && <span className="text-mc-diamond text-xs font-mono">✓ Installed</span>}
                  <button onClick={() => installModpack(mod.id)} disabled={installingMod === mod.id || server.status === 'online'}
                    className="mt-1 w-full py-1.5 text-xs font-body uppercase border border-mc-grass/30 text-mc-grass hover:bg-mc-grass/10 transition-all disabled:opacity-40">
                    {installingMod === mod.id ? 'Installing...' : 'Install'}
                  </button>
                </div>
              ))}
            </div>
            {server.status === 'online' && (
              <p className="text-gray-600 text-xs font-mono mt-3">Stop the server before installing a modpack.</p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
