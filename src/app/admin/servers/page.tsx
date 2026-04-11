'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import DashboardHeader from '@/components/layout/DashboardHeader'
import { Search, PauseCircle, Trash2, Terminal, RefreshCw, PlayCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useAdminGuard } from '@/lib/useAdmin'

const STATUS_COLORS: Record<string, string> = {
  online: 'text-mc-emerald border-green-800', offline: 'text-gray-500 border-gray-700',
  suspended: 'text-mc-gold border-yellow-800', installing: 'text-mc-diamond border-teal-800',
  starting: 'text-mc-diamond border-teal-800', stopping: 'text-mc-gold border-yellow-800',
}

export default function AdminServersPage() {
  const { isAdmin, loading: authLoading } = useAdminGuard()
  const [servers, setServers] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)
  const [toast, setToast] = useState<string>('')
  const supabase = createClient()

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const loadServers = useCallback(async () => {
    setLoading(true)
    let q = supabase.from('servers').select('*, profiles(username, email), plans(name, display_name), nodes(name, location_city)').neq('status', 'deleted').order('created_at', { ascending: false })
    if (statusFilter !== 'all') q = q.eq('status', statusFilter)
    const { data } = await q
    setServers(data || [])
    setLoading(false)
  }, [statusFilter])

  useEffect(() => { if (isAdmin) loadServers() }, [isAdmin, loadServers])

  const suspendServer = async (id: string, currentStatus: string) => {
    setActionId(id)
    const newStatus = currentStatus === 'suspended' ? 'offline' : 'suspended'
    const res = await fetch(`/api/servers/${id}/power`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: newStatus === 'suspended' ? 'stop' : 'start' }),
    })

    await supabase.from('servers').update({ status: newStatus, suspend_reason: newStatus === 'suspended' ? 'Suspended by admin' : null }).eq('id', id)
    setServers(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s))
    showToast(newStatus === 'suspended' ? 'Server suspended.' : 'Server unsuspended.')
    setActionId(null)
  }

  const deleteServer = async (id: string) => {
    if (!confirm('Delete this server? This will remove it from Pterodactyl.')) return
    setActionId(id)
    await fetch(`/api/servers/${id}`, { method: 'DELETE' })
    setServers(prev => prev.filter(s => s.id !== id))
    showToast('Server deleted.')
    setActionId(null)
  }

  if (authLoading || !isAdmin) return null

  const filtered = servers.filter(s => {
    const srch = search.toLowerCase()
    return (!srch || s.name?.toLowerCase().includes(srch) || s.profiles?.username?.toLowerCase().includes(srch)) &&
      (statusFilter === 'all' || s.status === statusFilter)
  })

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      <DashboardHeader title="Server Control" />
      {toast && <div className="fixed top-4 right-4 z-50 px-4 py-3 text-sm font-body border border-mc-grass/40 bg-mc-grass/10 text-mc-grass">{toast}</div>}
      <div className="p-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input type="text" placeholder="Search servers or owners..." value={search}
              onChange={e => setSearch(e.target.value)} className="mc-input pl-9 w-full" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all', 'online', 'offline', 'suspended', 'installing'].map(f => (
              <button key={f} onClick={() => setStatusFilter(f)}
                className={`px-4 py-2 text-xs font-mono uppercase border transition-all ${statusFilter === f ? 'border-mc-diamond text-mc-diamond bg-mc-diamond/5' : 'border-mc-card-border text-gray-500 hover:text-white'}`}>
                {f}
              </button>
            ))}
            <button onClick={loadServers} className="px-3 py-2 border border-mc-card-border text-gray-500 hover:text-white transition-all">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Total', value: servers.length, color: 'text-white' },
            { label: 'Online', value: servers.filter(s => s.status === 'online').length, color: 'text-mc-emerald' },
            { label: 'Suspended', value: servers.filter(s => s.status === 'suspended').length, color: 'text-mc-gold' },
          ].map(({ label, value, color }) => (
            <div key={label} className="mc-card p-3 text-center">
              <div className={`text-xl font-body font-bold ${color}`}>{value}</div>
              <div className="text-gray-500 text-xs font-mono">{label}</div>
            </div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mc-card border border-mc-card-border overflow-x-auto">
          <table className="w-full text-sm font-body min-w-[700px]">
            <thead>
              <tr className="border-b border-mc-card-border text-left">
                {['Server', 'Owner', 'Type', 'Node', 'Plan', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-xs font-mono text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-mc-card-border">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-600 font-mono text-sm">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-600 font-mono text-sm">No servers found.</td></tr>
              ) : filtered.map((srv, i) => (
                <motion.tr key={srv.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="hover:bg-mc-hover-bg transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-white font-medium">{srv.name}</span>
                    <div className="text-gray-600 text-xs font-mono">{srv.id.slice(0, 8)}</div>
                  </td>
                  <td className="px-4 py-3 text-mc-diamond text-xs font-mono">{srv.profiles?.username || '—'}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs font-mono">{srv.type} {srv.version}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs font-mono">{srv.nodes?.name || '—'}</td>
                  <td className="px-4 py-3">
                    <span className="mc-badge text-mc-diamond border-teal-800 text-xs">{srv.plans?.display_name || '—'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`mc-badge text-xs ${STATUS_COLORS[srv.status] || STATUS_COLORS.offline}`}>{srv.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => suspendServer(srv.id, srv.status)} disabled={actionId === srv.id}
                        className={`p-1.5 transition-colors ${srv.status === 'suspended' ? 'text-mc-grass hover:text-mc-grass/80' : 'text-mc-gold hover:text-mc-gold/80'}`}
                        title={srv.status === 'suspended' ? 'Unsuspend' : 'Suspend'}>
                        {actionId === srv.id ? <RefreshCw size={13} className="animate-spin" /> : srv.status === 'suspended' ? <PlayCircle size={13} /> : <PauseCircle size={13} />}
                      </button>
                      <button onClick={() => deleteServer(srv.id)} disabled={actionId === srv.id}
                        className="p-1.5 text-gray-500 hover:text-mc-redstone transition-colors" title="Delete">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </div>
  )
}
