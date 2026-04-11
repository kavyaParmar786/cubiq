'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import DashboardHeader from '@/components/layout/DashboardHeader'
import { Server, CreditCard, Ticket, MemoryStick, Zap, ArrowUpRight, Activity } from 'lucide-react'
import Link from 'next/link'
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { createClient, type Server as ServerType } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'

interface DashStats {
  servers: ServerType[]
  activeServers: number
  openTickets: number
  totalRamMB: number
  allocatedRamMB: number
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashStats>({ servers: [], activeServers: 0, openTickets: 0, totalRamMB: 0, allocatedRamMB: 0 })
  const [liveStats, setLiveStats] = useState<Record<string, { cpu: number; ram: number }>>({})
  const [cpuHistory, setCpuHistory] = useState<{ t: number; v: number }[]>([])
  const [ramHistory, setRamHistory] = useState<{ t: number; v: number }[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!user) return
    loadDashboard()
  }, [user])

  // Poll live stats every 5s for online servers
  useEffect(() => {
    if (!stats.servers.length) return
    const onlineServers = stats.servers.filter(s => s.status === 'online' || s.status === 'starting')
    if (!onlineServers.length) return

    const poll = async () => {
      const results: Record<string, { cpu: number; ram: number }> = {}
      await Promise.all(onlineServers.map(async (srv) => {
        try {
          const res = await fetch(`/api/servers/${srv.id}/stats`)
          if (res.ok) {
            const data = await res.json()
            results[srv.id] = { cpu: data.cpu, ram: data.ram }
          }
        } catch {}
      }))
      setLiveStats(results)

      // Aggregate CPU/RAM for charts
      const totalCpu = Object.values(results).reduce((a, b) => a + b.cpu, 0)
      const avgCpu = onlineServers.length ? totalCpu / onlineServers.length : 0
      const totalRam = Object.values(results).reduce((a, b) => a + b.ram, 0)
      const now = Date.now()
      setCpuHistory(prev => [...prev.slice(-29), { t: now, v: Math.round(avgCpu) }])
      setRamHistory(prev => [...prev.slice(-29), { t: now, v: Math.round(totalRam) }])
    }

    poll()
    const interval = setInterval(poll, 5000)
    return () => clearInterval(interval)
  }, [stats.servers])

  async function loadDashboard() {
    setLoading(true)
    const [serversRes, ticketsRes] = await Promise.all([
      supabase.from('servers').select('*, plans(name, display_name, ram), nodes(name, location_city)').eq('user_id', user!.id).neq('status', 'deleted').order('created_at', { ascending: false }),
      supabase.from('tickets').select('id').eq('user_id', user!.id).in('status', ['open', 'waiting']),
    ])

    const servers = (serversRes.data || []) as ServerType[]
    const activeServers = servers.filter(s => s.status === 'online').length
    const allocatedRamMB = servers.reduce((acc, s) => acc + (s.ram || 0), 0)

    setStats({ servers, activeServers, openTickets: ticketsRes.data?.length || 0, totalRamMB: 0, allocatedRamMB })
    setLoading(false)
  }

  const formatUptime = (ms: number) => {
    const d = Math.floor(ms / 86400000)
    const h = Math.floor((ms % 86400000) / 3600000)
    return d > 0 ? `${d}d ${h}h` : `${h}h`
  }

  if (loading) {
    return (
      <div className="flex flex-col flex-1 overflow-y-auto">
        <DashboardHeader title="Overview" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-4 animate-bounce">⚡</div>
            <p className="text-gray-500 font-minecraft text-xs" style={{ fontFamily: "'Press Start 2P', monospace" }}>Loading world...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      <DashboardHeader title="Overview" />
      <div className="p-6 flex flex-col gap-6">

        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="mc-card p-5 border border-mc-grass/20 bg-gradient-to-r from-mc-grass/5 to-transparent flex items-center justify-between">
          <div>
            <h2 className="text-white font-body font-semibold text-base">
              Welcome back, <span className="text-mc-grass">{user?.username}!</span> 👋
            </h2>
            <p className="text-gray-500 text-sm font-body mt-1">
              {stats.activeServers > 0
                ? `${stats.activeServers} server${stats.activeServers > 1 ? 's' : ''} running. All systems normal.`
                : 'No servers running. Deploy your first server!'}
            </p>
          </div>
          <Link href="/dashboard/servers/create" className="mc-btn text-xs px-4 py-2 flex items-center gap-2 hidden sm:flex">
            <Zap size={12} /> New Server
          </Link>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Server, label: 'Active Servers', value: String(stats.activeServers), sub: `${stats.servers.length} total`, color: 'text-mc-grass' },
            { icon: Activity, label: 'Avg CPU', value: stats.activeServers ? `${Math.round(Object.values(liveStats).reduce((a, b) => a + b.cpu, 0) / Math.max(stats.activeServers, 1))}%` : '—', sub: 'Live', color: 'text-mc-diamond' },
            { icon: MemoryStick, label: 'RAM Allocated', value: `${Math.round(stats.allocatedRamMB / 1024)}GB`, sub: 'across all servers', color: 'text-mc-gold' },
            { icon: Ticket, label: 'Open Tickets', value: String(stats.openTickets), sub: 'awaiting reply', color: 'text-mc-redstone' },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="mc-card p-5 flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-xs font-mono uppercase tracking-wider mb-1">{stat.label}</p>
                <p className={`text-2xl font-body font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-gray-600 text-xs font-mono mt-1">{stat.sub}</p>
              </div>
              <div className={`p-2.5 border border-mc-card-border ${stat.color}`}><stat.icon size={20} /></div>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[
            { label: 'CPU Usage (live)', data: cpuHistory, color: '#4EEBD0', unit: '%' },
            { label: 'RAM Usage MB (live)', data: ramHistory, color: '#FFD700', unit: 'MB' },
          ].map(({ label, data, color, unit }) => (
            <motion.div key={label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mc-card p-5">
              <h3 className="text-gray-400 text-xs font-mono uppercase tracking-wider mb-4">{label}</h3>
              {data.length > 1 ? (
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={data}>
                    <XAxis dataKey="t" hide />
                    <Tooltip contentStyle={{ background: '#141420', border: '1px solid #2A2A3E', borderRadius: 0, fontSize: 11 }}
                      formatter={(v: any) => [`${v}${unit}`, '']} labelFormatter={() => ''} />
                    <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[120px] flex items-center justify-center text-gray-600 text-xs font-mono">
                  {stats.activeServers === 0 ? 'No servers online' : 'Collecting data...'}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Servers List */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mc-card">
          <div className="px-6 py-4 border-b border-mc-card-border flex items-center justify-between">
            <h3 className="text-white font-body font-semibold text-sm uppercase tracking-wider">My Servers</h3>
            <Link href="/dashboard/servers" className="text-mc-diamond text-xs font-mono hover:underline flex items-center gap-1">
              View all <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-mc-card-border">
            {stats.servers.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-600 text-sm font-body">
                No servers yet. <Link href="/dashboard/servers/create" className="text-mc-diamond hover:underline">Deploy your first one →</Link>
              </div>
            ) : stats.servers.slice(0, 4).map((srv) => {
              const live = liveStats[srv.id]
              const plan = (srv as any).plans
              return (
                <div key={srv.id} className="px-6 py-4 flex items-center justify-between hover:bg-mc-hover-bg transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`status-${srv.status}`}>{srv.status}</div>
                    <div>
                      <p className="text-white font-body font-medium text-sm">{srv.name}</p>
                      <p className="text-gray-600 text-xs font-mono">{srv.type} {srv.version}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono text-gray-500">
                    {live && <span>CPU {live.cpu.toFixed(1)}%</span>}
                    {live && <span>RAM {live.ram}MB</span>}
                    {plan && <span className="mc-badge text-mc-diamond border-teal-800">{plan.display_name}</span>}
                    <Link href={`/dashboard/servers/${srv.id}`} className="mc-btn-diamond px-3 py-1 text-xs">Manage</Link>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Create Server', href: '/dashboard/servers/create', icon: Server, color: 'border-mc-grass/30 hover:border-mc-grass/60' },
            { label: 'Billing', href: '/dashboard/billing', icon: CreditCard, color: 'border-mc-diamond/30 hover:border-mc-diamond/60' },
            { label: 'Support', href: '/dashboard/tickets', icon: Ticket, color: 'border-mc-gold/30 hover:border-mc-gold/60' },
            { label: 'Bot Hosting', href: '/dashboard/bots', icon: MemoryStick, color: 'border-mc-redstone/30 hover:border-mc-redstone/60' },
          ].map(({ label, href, icon: Icon, color }) => (
            <Link key={label} href={href} className={`mc-card p-4 border transition-all duration-200 flex flex-col items-center gap-2 text-center hover:bg-mc-hover-bg ${color}`}>
              <Icon size={20} className="text-gray-400" />
              <span className="text-gray-300 text-xs font-body font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
