'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import DashboardHeader from '@/components/layout/DashboardHeader'
import { Search, PauseCircle, Trash2, Eye, RefreshCw, Filter } from 'lucide-react'

const mockServers = [
  { id: 's1', name: 'SurvivalSMP', owner: 'Steve_Miner', type: 'Paper 1.20.4', node: 'Mumbai IN', status: 'online', players: '12/20', ram: '2.1GB', cpu: '34%', plan: 'DIAMOND' },
  { id: 's2', name: 'SkyblockNetwork', owner: 'AlexBuilder', type: 'Paper 1.20.4', node: 'US East', status: 'online', players: '43/100', ram: '6.8GB', cpu: '71%', plan: 'NETHERITE' },
  { id: 's3', name: 'CreativePlot', owner: 'Steve_Miner', type: 'Paper 1.20.4', node: 'Mumbai IN', status: 'online', players: '3/10', ram: '0.8GB', cpu: '12%', plan: 'IRON' },
  { id: 's4', name: 'RPGWorld', owner: 'PixelQueen', type: 'Forge 1.20.1', node: 'EU West', status: 'offline', players: '0/30', ram: '0GB', cpu: '0%', plan: 'DIAMOND' },
  { id: 's5', name: 'TestBot', owner: 'DevBot_Riya', type: 'Node.js Bot', node: 'Mumbai IN', status: 'online', players: '—', ram: '128MB', cpu: '2%', plan: 'BOT PRO' },
  { id: 's6', name: 'BungeeProxy', owner: 'NetworkDev', type: 'BungeeCord', node: 'US East', status: 'suspended', players: '0/—', ram: '0GB', cpu: '0%', plan: 'NETHERITE' },
]

const statusStyles: Record<string, string> = {
  online: 'text-mc-emerald',
  offline: 'text-gray-500',
  suspended: 'text-mc-redstone',
  starting: 'text-mc-gold',
}

export default function AdminServersPage() {
  const [servers, setServers] = useState(mockServers)
  const [search, setSearch] = useState('')
  const [nodeFilter, setNodeFilter] = useState('all')
  const [confirmAction, setConfirmAction] = useState<{ serverId: string; action: string } | null>(null)

  const nodes = ['all', ...Array.from(new Set(mockServers.map(s => s.node)))]

  const filtered = servers.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.owner.toLowerCase().includes(search.toLowerCase())
    const matchNode = nodeFilter === 'all' || s.node === nodeFilter
    return matchSearch && matchNode
  })

  const handleAction = (serverId: string, action: string) => {
    if (action === 'suspend') {
      setServers(prev => prev.map(s => s.id === serverId
        ? { ...s, status: s.status === 'suspended' ? 'offline' : 'suspended' }
        : s
      ))
    } else if (action === 'delete') {
      setServers(prev => prev.filter(s => s.id !== serverId))
    } else if (action === 'restart') {
      setServers(prev => prev.map(s => s.id === serverId ? { ...s, status: 'online' } : s))
    }
    setConfirmAction(null)
  }

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      <DashboardHeader title="Server Control" />
      <div className="p-6">

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search servers or owners..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="mc-input pl-9 pr-4 py-2.5 text-sm"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={14} className="text-gray-500" />
            {nodes.map(n => (
              <button
                key={n}
                onClick={() => setNodeFilter(n)}
                className={`px-3 py-2 text-xs font-mono uppercase border transition-all ${
                  nodeFilter === n ? 'border-mc-diamond text-mc-diamond bg-mc-diamond/5' : 'border-mc-card-border text-gray-500 hover:text-white'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Mini stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total', value: servers.length },
            { label: 'Online', value: servers.filter(s => s.status === 'online').length },
            { label: 'Offline', value: servers.filter(s => s.status === 'offline').length },
            { label: 'Suspended', value: servers.filter(s => s.status === 'suspended').length },
          ].map(({ label, value }) => (
            <div key={label} className="mc-card p-3 text-center">
              <div className="text-white font-bold font-body text-xl">{value}</div>
              <div className="text-gray-500 text-xs font-mono uppercase mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="mc-card border border-mc-card-border overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="border-b border-mc-card-border">
                {['Server', 'Owner', 'Type', 'Node', 'Status', 'Resources', 'Plan', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-mono uppercase tracking-wider text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-mc-card-border">
              {filtered.map((srv, i) => (
                <motion.tr
                  key={srv.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="hover:bg-mc-hover-bg transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className="text-white font-body font-medium">{srv.name}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs font-mono">{srv.owner}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs font-mono">{srv.type}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs font-mono">📍 {srv.node}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-mono uppercase flex items-center gap-1.5 ${statusStyles[srv.status]}`}>
                      <span className={`w-1.5 h-1.5 rounded-full bg-current ${srv.status === 'online' ? 'animate-pulse' : ''}`} />
                      {srv.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs font-mono">
                    {srv.ram} · {srv.cpu}
                  </td>
                  <td className="px-4 py-3">
                    <span className="mc-badge text-mc-diamond border-teal-800 text-xs">{srv.plan}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button title="View" className="p-1.5 text-gray-500 hover:text-mc-diamond transition-colors">
                        <Eye size={13} />
                      </button>
                      <button
                        title="Restart"
                        onClick={() => handleAction(srv.id, 'restart')}
                        className="p-1.5 text-gray-500 hover:text-mc-gold transition-colors"
                      >
                        <RefreshCw size={13} />
                      </button>
                      <button
                        title={srv.status === 'suspended' ? 'Unsuspend' : 'Suspend'}
                        onClick={() => setConfirmAction({ serverId: srv.id, action: 'suspend' })}
                        className="p-1.5 text-gray-500 hover:text-mc-gold transition-colors"
                      >
                        <PauseCircle size={13} />
                      </button>
                      <button
                        title="Delete"
                        onClick={() => setConfirmAction({ serverId: srv.id, action: 'delete' })}
                        className="p-1.5 text-gray-500 hover:text-mc-redstone transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Confirm modal */}
        {confirmAction && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mc-card p-8 max-w-sm w-full border border-mc-redstone/30"
            >
              <h3 className="text-white font-body font-bold text-base mb-2">Confirm Server Action</h3>
              <p className="text-gray-400 text-sm font-body mb-6">
                Are you sure you want to{' '}
                <span className="text-mc-redstone font-semibold">{confirmAction.action}</span> this server?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleAction(confirmAction.serverId, confirmAction.action)}
                  className="flex-1 py-2.5 bg-mc-redstone border border-red-700 text-white text-sm font-body uppercase tracking-wider hover:brightness-110"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setConfirmAction(null)}
                  className="flex-1 py-2.5 border border-mc-card-border text-gray-400 text-sm hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
