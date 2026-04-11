'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import DashboardHeader from '@/components/layout/DashboardHeader'
import { Search, Ban, Trash2, Eye, UserCheck, RefreshCw } from 'lucide-react'
import { createClient, type Profile } from '@/lib/supabase'
import { useAdminGuard } from '@/lib/useAdmin'

const STATUS_COLORS: Record<string, string> = {
  active: 'text-mc-emerald border-green-800',
  suspended: 'text-mc-gold border-yellow-800',
  banned: 'text-mc-redstone border-red-800',
}

export default function AdminUsersPage() {
  const { isAdmin, loading: authLoading } = useAdminGuard()
  const [users, setUsers] = useState<Profile[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
  const supabase = createClient()

  const loadUsers = useCallback(async () => {
    setLoading(true)
    let q = supabase.from('profiles').select('*').order('created_at', { ascending: false })
    if (filter !== 'all') q = q.eq('status', filter)
    if (search) q = q.or(`username.ilike.%${search}%,email.ilike.%${search}%`)
    const { data } = await q
    setUsers(data || [])
    setLoading(false)
  }, [search, filter])

  useEffect(() => { if (isAdmin) loadUsers() }, [isAdmin, loadUsers])

  const updateStatus = async (id: string, status: string) => {
    setActionId(id)
    await supabase.from('profiles').update({ status }).eq('id', id)
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: status as any } : u))
    setSelectedUser(prev => prev?.id === id ? { ...prev, status: status as any } : prev)
    setActionId(null)
  }

  const deleteUser = async (id: string) => {
    if (!confirm('Delete this user and all their servers? This cannot be undone.')) return
    setActionId(id)
    await supabase.from('profiles').delete().eq('id', id)
    setUsers(prev => prev.filter(u => u.id !== id))
    setSelectedUser(null)
    setActionId(null)
  }

  if (authLoading || !isAdmin) return null

  const filtered = users.filter(u => {
    const s = search.toLowerCase()
    return (!s || u.username.toLowerCase().includes(s) || u.email.toLowerCase().includes(s)) &&
      (filter === 'all' || u.status === filter)
  })

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      <DashboardHeader title="User Management" />
      <div className="p-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input type="text" placeholder="Search username or email..." value={search}
              onChange={e => setSearch(e.target.value)} className="mc-input pl-9 w-full" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all', 'active', 'suspended', 'banned'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2 text-xs font-mono uppercase border transition-all ${filter === f ? 'border-mc-diamond text-mc-diamond bg-mc-diamond/5' : 'border-mc-card-border text-gray-500 hover:text-white'}`}>
                {f}
              </button>
            ))}
            <button onClick={loadUsers} className="px-3 py-2 border border-mc-card-border text-gray-500 hover:text-white transition-all">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Total Users', value: users.length, color: 'text-white' },
            { label: 'Active', value: users.filter(u => u.status === 'active').length, color: 'text-mc-emerald' },
            { label: 'Restricted', value: users.filter(u => u.status !== 'active').length, color: 'text-mc-redstone' },
          ].map(({ label, value, color }) => (
            <div key={label} className="mc-card p-3 text-center">
              <div className={`text-xl font-body font-bold ${color}`}>{value}</div>
              <div className="text-gray-500 text-xs font-mono">{label}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mc-card border border-mc-card-border overflow-x-auto">
          <table className="w-full text-sm font-body min-w-[600px]">
            <thead>
              <tr className="border-b border-mc-card-border text-left">
                {['User', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-xs font-mono text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-mc-card-border">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-600 font-mono text-sm">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-600 font-mono text-sm">No users found.</td></tr>
              ) : filtered.map((user, i) => (
                <motion.tr key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="hover:bg-mc-hover-bg transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-mc-grass/10 border border-mc-grass/20 flex items-center justify-center text-xs font-mono text-mc-grass pixel-art">
                        {user.username[0]?.toUpperCase()}
                      </div>
                      <span className="text-white font-medium">{user.username}</span>
                      {user.role === 'admin' && <span className="mc-badge text-mc-redstone border-red-800 text-xs">ADMIN</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">{user.email}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{user.role}</td>
                  <td className="px-4 py-3">
                    <span className={`mc-badge text-xs ${STATUS_COLORS[user.status] || STATUS_COLORS.active}`}>{user.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs font-mono whitespace-nowrap">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => setSelectedUser(user)} className="p-1.5 text-gray-500 hover:text-mc-diamond transition-colors"><Eye size={13} /></button>
                      <button onClick={() => updateStatus(user.id, user.status === 'banned' ? 'active' : 'banned')}
                        disabled={actionId === user.id}
                        className={`p-1.5 transition-colors ${user.status === 'banned' ? 'text-mc-grass' : 'text-mc-gold'}`}>
                        {actionId === user.id ? <RefreshCw size={13} className="animate-spin" /> : user.status === 'banned' ? <UserCheck size={13} /> : <Ban size={13} />}
                      </button>
                      <button onClick={() => deleteUser(user.id)} disabled={actionId === user.id}
                        className="p-1.5 text-gray-500 hover:text-mc-redstone transition-colors"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Modal */}
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setSelectedUser(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              onClick={e => e.stopPropagation()} className="mc-card border border-mc-card-border p-6 w-full max-w-md mx-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-mc-grass/10 border-2 border-mc-grass/20 flex items-center justify-center text-2xl font-mono text-mc-grass pixel-art">
                  {selectedUser.username[0]?.toUpperCase()}
                </div>
                <div>
                  <h3 className="text-white font-body font-bold text-lg">{selectedUser.username}</h3>
                  <p className="text-gray-500 text-sm font-mono">{selectedUser.email}</p>
                </div>
              </div>
              <div className="space-y-2 mb-6">
                {[
                  ['Role', selectedUser.role],
                  ['Status', selectedUser.status],
                  ['Pterodactyl ID', selectedUser.pterodactyl_id || 'Not linked'],
                  ['Joined', new Date(selectedUser.created_at).toLocaleString()],
                ].map(([k, v]) => (
                  <div key={String(k)} className="flex justify-between py-2 border-b border-mc-card-border text-sm">
                    <span className="text-gray-500 font-body">{k}</span>
                    <span className="text-white font-mono">{v}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => updateStatus(selectedUser.id, selectedUser.status === 'suspended' ? 'active' : 'suspended')}
                  className="flex-1 py-2 text-xs uppercase border border-mc-gold/40 text-mc-gold hover:bg-mc-gold/10 transition-all font-body">
                  {selectedUser.status === 'suspended' ? 'Activate' : 'Suspend'}
                </button>
                <button onClick={() => updateStatus(selectedUser.id, selectedUser.status === 'banned' ? 'active' : 'banned')}
                  className="flex-1 py-2 text-xs uppercase border border-mc-redstone/40 text-mc-redstone hover:bg-mc-redstone/10 transition-all font-body">
                  {selectedUser.status === 'banned' ? 'Unban' : 'Ban'}
                </button>
                <button onClick={() => setSelectedUser(null)} className="px-4 py-2 text-xs text-gray-500 border border-mc-card-border hover:text-white transition-all">Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
