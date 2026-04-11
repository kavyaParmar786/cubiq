'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import DashboardHeader from '@/components/layout/DashboardHeader'
import { Server, Plus, Play, Square, RotateCcw, Settings, Cpu, MemoryStick, RefreshCw } from 'lucide-react'
import { createClient, type Server as ServerType } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'

export default function ServersPage() {
  const { user } = useAuth()
  const [servers, setServers] = useState<ServerType[]>([])
  const [liveStats, setLiveStats] = useState<Record<string, { cpu: number; ram: number; state: string }>>({})
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)
  const supabase = createClient()

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const loadServers = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('servers')
      .select('*, plans(name, display_name, ram, cpu), nodes(name, location_city, location_flag)')
      .eq('user_id', user.id)
      .neq('status', 'deleted')
      .order('created_at', { ascending: false })
    setServers((data || []) as ServerType[])
    setLoading(false)
  }, [user])

  useEffect(() => { loadServers() }, [loadServers])

  // Poll stats for online servers
  useEffect(() => {
    const online = servers.filter(s => ['online', 'starting'].includes(s.status))
    if (!online.length) return

    const poll = async () => {
      const results: typeof liveStats = {}
      await Promise.all(online.map(async srv => {
        try {
          const res = await fetch(`/api/servers/${srv.id}/stats`)
          if (res.ok) {
            const d = await res.json()
            results[srv.id] = { cpu: d.cpu, ram: d.ram, state: d.state }
          }
        } catch {}
      }))
      setLiveStats(results)
    }
    poll()
    const iv = setInterval(poll, 5000)
    return () => clearInterval(iv)
  }, [servers.map(s => s.id).join()])

  const handlePower = async (serverId: string, action: 'start' | 'stop' | 'restart') => {
    setActionLoading(`${serverId}-${action}`)
    try {
      const res = await fetch(`/api/servers/${serverId}/power`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setServers(prev => prev.map(s => s.id === serverId ? { ...s, status: data.status as any } : s))
      showToast(`Server ${action} sent!`)
    } catch (err: any) {
      showToast(err.message, 'err')
    } finally {
      setActionLoading(null)
    }
  }

  const formatUptime = (s: ServerType) => {
    const created = new Date(s.created_at).getTime()
    const diff = Date.now() - created
    const d = Math.floor(diff / 86400000)
    const h = Math.floor((diff % 86400000) / 3600000)
    return s.status === 'online' ? (d > 0 ? `${d}d ${h}h` : `${h}h`) : '—'
  }

  if (loading) return (
    <div className="flex flex-col flex-1"><DashboardHeader title="My Servers" />
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500 font-mono text-sm animate-pulse">Loading servers...</p>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      <DashboardHeader title="My Servers" />

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 text-sm font-body border ${toast.type === 'ok' ? 'border-mc-grass/40 bg-mc-grass/10 text-mc-grass' : 'border-mc-redstone/40 bg-mc-redstone/10 text-mc-redstone'}`}>
          {toast.msg}
        </div>
      )}

      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-500 text-sm font-body">{servers.length} server{servers.length !== 1 ? 's' : ''}</p>
          <div className="flex gap-2">
            <button onClick={loadServers} className="border border-mc-card-border text-gray-500 hover:text-white px-3 py-2 text-xs transition-all flex items-center gap-1">
              <RefreshCw size={12} /> Refresh
            </button>
            <Link href="/dashboard/servers/create" className="mc-btn flex items-center gap-2 text-xs px-4 py-2">
              <Plus size={14} /> Create Server
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {servers.length === 0 ? (
            <div className="mc-card p-16 text-center border border-dashed border-mc-card-border">
              <Server size={40} className="text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 font-body mb-4">No servers yet.</p>
              <Link href="/dashboard/servers/create" className="mc-btn inline-flex items-center gap-2 text-sm px-6 py-3">
                <Plus size={14} /> Deploy First Server
              </Link>
            </div>
          ) : servers.map((srv, i) => {
            const live = liveStats[srv.id]
            const plan = (srv as any).plans
            const node = (srv as any).nodes
            const cpuPct = live?.cpu || 0
            const ramMB = live?.ram || 0
            const ramMaxMB = srv.ram || plan?.ram || 1024
            const ramPct = Math.round((ramMB / ramMaxMB) * 100)

            return (
              <motion.div key={srv.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }} className="mc-card p-6 border border-mc-card-border">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 pixel-art border-2 flex items-center justify-center flex-shrink-0 ${srv.status === 'online' ? 'bg-mc-grass/10 border-mc-grass/30' : 'bg-mc-card-border border-mc-stone/20'}`}>
                      <Server size={20} className={srv.status === 'online' ? 'text-mc-grass' : 'text-gray-500'} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <h3 className="text-white font-body font-bold">{srv.name}</h3>
                        <div className={`status-${srv.status}`}>{srv.status}</div>
                        {plan && <span className="mc-badge text-mc-diamond border-teal-800 text-xs">{plan.display_name}</span>}
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs font-mono text-gray-500">
                        <span>{srv.type} {srv.version}</span>
                        {node && <span>📍 {node.location_flag} {node.location_city}</span>}
                        {srv.connection_ip && <span className="text-gray-400">{srv.connection_ip}:{srv.connection_port}</span>}
                        <span>⏱ {formatUptime(srv)}</span>
                      </div>

                      {/* Resource bars */}
                      {live && (
                        <div className="flex gap-6 mt-3">
                          <div className="flex items-center gap-2 text-xs">
                            <Cpu size={12} className="text-mc-diamond" />
                            <div className="w-20 mc-progress h-2">
                              <div className={`mc-progress-bar h-full ${cpuPct > 80 ? 'danger' : cpuPct > 60 ? 'warning' : ''}`}
                                style={{ width: `${Math.min(cpuPct, 100)}%` }} />
                            </div>
                            <span className="text-gray-500 w-10">{cpuPct.toFixed(1)}%</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <MemoryStick size={12} className="text-mc-gold" />
                            <div className="w-20 mc-progress h-2">
                              <div className={`mc-progress-bar warning h-full ${ramPct > 80 ? 'danger' : ''}`}
                                style={{ width: `${Math.min(ramPct, 100)}%` }} />
                            </div>
                            <span className="text-gray-500">{ramMB}MB</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {srv.status === 'online' || srv.status === 'starting' ? (
                      <>
                        <button onClick={() => handlePower(srv.id, 'restart')}
                          disabled={!!actionLoading}
                          className="px-3 py-2 border border-mc-gold/40 text-mc-gold hover:bg-mc-gold/10 text-xs uppercase flex items-center gap-1 transition-all disabled:opacity-50">
                          <RotateCcw size={12} className={actionLoading === `${srv.id}-restart` ? 'animate-spin' : ''} /> Restart
                        </button>
                        <button onClick={() => handlePower(srv.id, 'stop')}
                          disabled={!!actionLoading}
                          className="px-3 py-2 border border-mc-redstone/40 text-mc-redstone hover:bg-mc-redstone/10 text-xs uppercase flex items-center gap-1 transition-all disabled:opacity-50">
                          <Square size={12} /> Stop
                        </button>
                      </>
                    ) : srv.status === 'offline' ? (
                      <button onClick={() => handlePower(srv.id, 'start')}
                        disabled={!!actionLoading}
                        className="px-3 py-2 border border-mc-grass/40 text-mc-grass hover:bg-mc-grass/10 text-xs uppercase flex items-center gap-1 transition-all disabled:opacity-50">
                        {actionLoading === `${srv.id}-start` ? <RefreshCw size={12} className="animate-spin" /> : <Play size={12} />} Start
                      </button>
                    ) : (
                      <span className="text-xs font-mono text-gray-500 px-3">{srv.status}...</span>
                    )}
                    <Link href={`/dashboard/servers/${srv.id}`} className="mc-btn-diamond px-4 py-2 text-xs flex items-center gap-1">
                      <Settings size={12} /> Manage
                    </Link>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
