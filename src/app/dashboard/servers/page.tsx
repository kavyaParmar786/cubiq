'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import DashboardHeader from '@/components/layout/DashboardHeader'
import { Server, Plus, Play, Square, RotateCcw, Settings, Cpu, MemoryStick } from 'lucide-react'

const servers = [
  {
    id: 's1',
    name: 'SurvivalSMP',
    type: 'Paper',
    version: '1.20.4',
    status: 'online',
    players: 12,
    maxPlayers: 20,
    cpu: 34,
    ram: 2.1,
    ramMax: 4,
    ip: 'smp.cubiqhost.com:25565',
    plan: 'DIAMOND',
    node: 'Mumbai IN',
    uptime: '14d 6h 22m',
  },
  {
    id: 's2',
    name: 'CreativePlot',
    type: 'Paper',
    version: '1.20.4',
    status: 'online',
    players: 3,
    maxPlayers: 10,
    cpu: 12,
    ram: 0.8,
    ramMax: 2,
    ip: 'creative.cubiqhost.com:25566',
    plan: 'IRON',
    node: 'Mumbai IN',
    uptime: '3d 2h 10m',
  },
  {
    id: 's3',
    name: 'TestServer',
    type: 'Vanilla',
    version: '1.19.4',
    status: 'offline',
    players: 0,
    maxPlayers: 5,
    cpu: 0,
    ram: 0,
    ramMax: 1,
    ip: 'test.cubiqhost.com:25567',
    plan: 'DIRT',
    node: 'Mumbai IN',
    uptime: '—',
  },
]

export default function ServersPage() {
  const [serverList, setServerList] = useState(servers)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const handleAction = (id: string, action: string) => {
    setActionLoading(`${id}-${action}`)
    setTimeout(() => {
      setServerList(prev => prev.map(s => {
        if (s.id !== id) return s
        const newStatus = action === 'start' ? 'online' : action === 'stop' ? 'offline' : s.status
        return { ...s, status: newStatus }
      }))
      setActionLoading(null)
    }, 1500)
  }

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      <DashboardHeader title="My Servers" />
      <div className="p-6">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-500 text-sm font-body">{serverList.length} server{serverList.length !== 1 ? 's' : ''} on your account</p>
          <Link href="/dashboard/servers/create" className="mc-btn flex items-center gap-2 text-xs px-4 py-2">
            <Plus size={14} /> Create Server
          </Link>
        </div>

        {/* Server Cards */}
        <div className="flex flex-col gap-4">
          {serverList.map((srv, i) => (
            <motion.div
              key={srv.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="mc-card p-6 border border-mc-card-border"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left: Info */}
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 pixel-art border-2 flex items-center justify-center flex-shrink-0 ${
                    srv.status === 'online' ? 'bg-mc-grass/10 border-mc-grass/30' : 'bg-mc-card-border border-mc-stone/20'
                  }`}>
                    <Server size={20} className={srv.status === 'online' ? 'text-mc-grass' : 'text-gray-500'} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-white font-body font-bold text-base">{srv.name}</h3>
                      <div className={`status-${srv.status}`}>{srv.status}</div>
                      <span className="mc-badge text-mc-diamond border-teal-800 text-xs">{srv.plan}</span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs font-mono text-gray-500">
                      <span>{srv.type} {srv.version}</span>
                      <span>📍 {srv.node}</span>
                      <span className="text-gray-400">{srv.ip}</span>
                      <span>⏱ {srv.uptime}</span>
                    </div>

                    {/* Stats bars */}
                    <div className="flex gap-6 mt-3">
                      <div className="flex items-center gap-2 text-xs">
                        <Cpu size={12} className="text-mc-diamond" />
                        <div className="w-20 mc-progress h-2">
                          <div
                            className={`mc-progress-bar h-full ${srv.cpu > 80 ? 'danger' : srv.cpu > 60 ? 'warning' : ''}`}
                            style={{ width: `${srv.cpu}%` }}
                          />
                        </div>
                        <span className="text-gray-500 w-8">{srv.cpu}%</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <MemoryStick size={12} className="text-mc-gold" />
                        <div className="w-20 mc-progress h-2">
                          <div
                            className="mc-progress-bar warning h-full"
                            style={{ width: `${(srv.ram / srv.ramMax) * 100}%` }}
                          />
                        </div>
                        <span className="text-gray-500">{srv.ram}/{srv.ramMax}GB</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        👥 {srv.players}/{srv.maxPlayers}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {srv.status === 'online' ? (
                    <>
                      <button
                        onClick={() => handleAction(srv.id, 'restart')}
                        disabled={!!actionLoading}
                        className="px-3 py-2 border border-mc-gold/40 text-mc-gold hover:bg-mc-gold/10 transition-all text-xs font-body uppercase flex items-center gap-1"
                      >
                        <RotateCcw size={12} className={actionLoading === `${srv.id}-restart` ? 'animate-spin' : ''} />
                        Restart
                      </button>
                      <button
                        onClick={() => handleAction(srv.id, 'stop')}
                        disabled={!!actionLoading}
                        className="px-3 py-2 border border-mc-redstone/40 text-mc-redstone hover:bg-mc-redstone/10 transition-all text-xs font-body uppercase flex items-center gap-1"
                      >
                        <Square size={12} />
                        Stop
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleAction(srv.id, 'start')}
                      disabled={!!actionLoading}
                      className="px-3 py-2 border border-mc-grass/40 text-mc-grass hover:bg-mc-grass/10 transition-all text-xs font-body uppercase flex items-center gap-1"
                    >
                      <Play size={12} />
                      Start
                    </button>
                  )}
                  <Link
                    href={`/dashboard/servers/${srv.id}`}
                    className="mc-btn-diamond px-4 py-2 text-xs flex items-center gap-1"
                  >
                    <Settings size={12} /> Manage
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Empty state */}
          {serverList.length === 0 && (
            <div className="mc-card p-16 text-center border border-dashed border-mc-card-border">
              <Server size={40} className="text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 font-body mb-4">No servers yet. Deploy your first server!</p>
              <Link href="/dashboard/servers/create" className="mc-btn inline-flex items-center gap-2 text-sm px-6 py-3">
                <Plus size={14} /> Create First Server
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
