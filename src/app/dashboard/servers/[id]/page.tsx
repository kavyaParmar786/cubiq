'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import DashboardHeader from '@/components/layout/DashboardHeader'
import { Play, Square, RotateCcw, Terminal, FolderOpen, Package, Cpu, MemoryStick, Users, Clock } from 'lucide-react'
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

// Simulated console logs
const initialLogs = [
  { type: 'info', msg: '[Server] Starting Minecraft server version 1.20.4...' },
  { type: 'info', msg: '[Server] Loading properties' },
  { type: 'success', msg: '[Server] Preparing level "world"' },
  { type: 'default', msg: '[Server] Preparing start region for dimension minecraft:overworld' },
  { type: 'success', msg: '[Server] Done (4.521s)! For help, type "help"' },
  { type: 'info', msg: '[Player] Steve joined the game' },
  { type: 'default', msg: '<Steve> Anyone online?' },
]

const modpacks = [
  { id: 'vanilla', name: 'Vanilla', icon: '🌿', desc: 'Clean Minecraft' },
  { id: 'paper', name: 'Paper', icon: '📄', desc: 'Optimized Spigot' },
  { id: 'forge', name: 'Forge', icon: '⚙️', desc: 'Mod loader' },
  { id: 'fabric', name: 'Fabric', icon: '🧵', desc: 'Lightweight mods' },
  { id: 'rlcraft', name: 'RLCraft', icon: '🐉', desc: 'Hardcore survival' },
  { id: 'skyfactory4', name: 'SkyFactory 4', icon: '🌤', desc: 'Skyblock + mods' },
  { id: 'create', name: 'Create', icon: '⚙', desc: 'Automation mod' },
  { id: 'atm9', name: 'ATM9', icon: '✨', desc: 'All the Mods 9' },
]

export default function ServerDetailPage({ params }: { params: { id: string } }) {
  const [status, setStatus] = useState<'online' | 'offline' | 'starting'>('online')
  const [activeTab, setActiveTab] = useState<'console' | 'files' | 'modpacks'>('console')
  const [logs, setLogs] = useState(initialLogs)
  const [command, setCommand] = useState('')
  const [cpuHistory] = useState(() => Array.from({ length: 30 }, (_, i) => ({ t: i, v: Math.floor(20 + Math.random() * 40) })))
  const [ramHistory] = useState(() => Array.from({ length: 30 }, (_, i) => ({ t: i, v: Math.floor(40 + Math.random() * 30) })))
  const consoleEndRef = useRef<HTMLDivElement>(null)
  const [installingMod, setInstallingMod] = useState<string | null>(null)

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const sendCommand = () => {
    if (!command.trim()) return
    setLogs(prev => [...prev, { type: 'default', msg: `> ${command}` }, { type: 'info', msg: `[Server] Command executed: ${command}` }])
    setCommand('')
  }

  const handleAction = (action: string) => {
    if (action === 'start') {
      setStatus('starting')
      setLogs(prev => [...prev, { type: 'warn', msg: '[Server] Starting server...' }])
      setTimeout(() => {
        setStatus('online')
        setLogs(prev => [...prev, { type: 'success', msg: '[Server] Server is now online!' }])
      }, 3000)
    } else if (action === 'stop') {
      setStatus('offline')
      setLogs(prev => [...prev, { type: 'error', msg: '[Server] Server stopped.' }])
    } else if (action === 'restart') {
      setStatus('starting')
      setLogs(prev => [...prev, { type: 'warn', msg: '[Server] Restarting...' }])
      setTimeout(() => {
        setStatus('online')
        setLogs(prev => [...prev, { type: 'success', msg: '[Server] Restart complete!' }])
      }, 3000)
    }
  }

  const installModpack = (id: string) => {
    setInstallingMod(id)
    setLogs(prev => [...prev, { type: 'info', msg: `[Installer] Starting modpack installation: ${id}` }])
    setTimeout(() => {
      setLogs(prev => [...prev, { type: 'success', msg: `[Installer] Modpack installed successfully!` }])
      setInstallingMod(null)
    }, 3000)
  }

  const tabs = [
    { id: 'console', label: 'Console', icon: Terminal },
    { id: 'files', label: 'File Manager', icon: FolderOpen },
    { id: 'modpacks', label: 'Modpacks', icon: Package },
  ]

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      <DashboardHeader title="SurvivalSMP" />
      <div className="p-6 flex flex-col gap-6">

        {/* Server Info Bar */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mc-card p-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`status-${status}`}>{status}</div>
              <div className="text-sm font-mono text-gray-500">Paper 1.20.4 · Mumbai IN · smp.cubiqhost.com:25565</div>
            </div>
            <div className="flex gap-2">
              {status === 'online' ? (
                <>
                  <button onClick={() => handleAction('restart')} className="px-3 py-2 border border-mc-gold/40 text-mc-gold hover:bg-mc-gold/10 text-xs font-body uppercase flex items-center gap-1 transition-all">
                    <RotateCcw size={12} /> Restart
                  </button>
                  <button onClick={() => handleAction('stop')} className="px-3 py-2 border border-mc-redstone/40 text-mc-redstone hover:bg-mc-redstone/10 text-xs uppercase flex items-center gap-1 transition-all">
                    <Square size={12} /> Stop
                  </button>
                </>
              ) : (
                <button onClick={() => handleAction('start')} className="px-3 py-2 border border-mc-grass/40 text-mc-grass hover:bg-mc-grass/10 text-xs uppercase flex items-center gap-1 transition-all">
                  <Play size={12} /> Start
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Cpu, label: 'CPU', value: '34%', chart: cpuHistory, color: '#4EEBD0' },
            { icon: MemoryStick, label: 'RAM', value: '2.1 / 4GB', chart: ramHistory, color: '#FFD700' },
            { icon: Users, label: 'Players', value: '12 / 20', chart: null, color: '#5D9E2F' },
            { icon: Clock, label: 'Uptime', value: '14d 6h', chart: null, color: '#8B8B8B' },
          ].map(({ icon: Icon, label, value, chart, color }) => (
            <motion.div key={label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mc-card p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-xs font-mono text-gray-500 uppercase">
                  <Icon size={12} style={{ color }} /> {label}
                </div>
                <span className="text-white font-body font-bold text-sm">{value}</span>
              </div>
              {chart && (
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
        <div className="border-b border-mc-card-border flex gap-0">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-body uppercase tracking-wider transition-all border-b-2 -mb-px ${
                activeTab === id
                  ? 'text-mc-diamond border-mc-diamond'
                  : 'text-gray-500 border-transparent hover:text-white'
              }`}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {/* Console Tab */}
        {activeTab === 'console' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mc-card border border-mc-card-border">
            <div className="mc-console h-80 overflow-y-auto">
              {logs.map((log, i) => (
                <div key={i} className={`mc-console-line ${log.type}`}>
                  <span className="text-gray-600 mr-2 select-none">{String(i).padStart(3, '0')}</span>
                  {log.msg}
                </div>
              ))}
              <div ref={consoleEndRef} />
            </div>
            <div className="flex border-t border-mc-card-border">
              <span className="px-3 flex items-center text-mc-grass text-xs font-mono border-r border-mc-card-border select-none">
                &gt;
              </span>
              <input
                type="text"
                value={command}
                onChange={e => setCommand(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendCommand()}
                placeholder="Type a command..."
                className="flex-1 bg-transparent px-4 py-3 text-sm font-mono text-white focus:outline-none placeholder-gray-600"
              />
              <button
                onClick={sendCommand}
                className="px-4 text-mc-diamond hover:bg-mc-hover-bg transition-colors text-xs font-mono border-l border-mc-card-border"
              >
                SEND
              </button>
            </div>
          </motion.div>
        )}

        {/* File Manager Tab */}
        {activeTab === 'files' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mc-card border border-mc-card-border">
            <div className="px-4 py-3 border-b border-mc-card-border text-xs font-mono text-gray-500">
              📁 /home/container/
            </div>
            <div className="divide-y divide-mc-card-border">
              {[
                { name: 'world/', type: 'dir', size: '—', modified: '2024-06-12' },
                { name: 'plugins/', type: 'dir', size: '—', modified: '2024-06-11' },
                { name: 'logs/', type: 'dir', size: '—', modified: '2024-06-12' },
                { name: 'server.properties', type: 'file', size: '2.1 KB', modified: '2024-06-10' },
                { name: 'paper.jar', type: 'file', size: '38.2 MB', modified: '2024-06-08' },
                { name: 'eula.txt', type: 'file', size: '0.2 KB', modified: '2024-06-08' },
                { name: 'ops.json', type: 'file', size: '0.5 KB', modified: '2024-06-09' },
              ].map((f) => (
                <div key={f.name} className="flex items-center justify-between px-4 py-3 hover:bg-mc-hover-bg cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{f.type === 'dir' ? '📁' : '📄'}</span>
                    <span className="text-sm font-mono text-gray-300">{f.name}</span>
                  </div>
                  <div className="flex gap-8 text-xs font-mono text-gray-600">
                    <span>{f.size}</span>
                    <span>{f.modified}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Modpacks Tab */}
        {activeTab === 'modpacks' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-gray-500 text-sm font-body mb-4">
              ⚠️ Installing a modpack will reset your server files. Back up first.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {modpacks.map((mod) => (
                <div key={mod.id} className="mc-card p-4 flex flex-col items-center text-center gap-2 border border-mc-card-border hover:border-mc-diamond/30 transition-all">
                  <div className="text-3xl">{mod.icon}</div>
                  <div className="text-white font-body font-semibold text-sm">{mod.name}</div>
                  <div className="text-gray-500 text-xs">{mod.desc}</div>
                  <button
                    onClick={() => installModpack(mod.id)}
                    disabled={installingMod === mod.id}
                    className="mt-2 w-full py-1.5 text-xs font-body uppercase border border-mc-grass/30 text-mc-grass hover:bg-mc-grass/10 transition-all disabled:opacity-50"
                  >
                    {installingMod === mod.id ? 'Installing...' : 'Install'}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
