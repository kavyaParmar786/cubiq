'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import DashboardHeader from '@/components/layout/DashboardHeader'
import { Search, Ban, Trash2, Eye, UserCheck } from 'lucide-react'

const users = [
  { id: 1, username: 'Steve_Builder', email: 'steve@example.com', plan: 'DIAMOND', servers: 2, joined: '2024-01-15', status: 'active', spent: '₹2,448' },
  { id: 2, username: 'Alex_Miner', email: 'alex@example.com', plan: 'NETHERITE', servers: 3, joined: '2024-02-20', status: 'active', spent: '₹8,991' },
  { id: 3, username: 'CreepyBot99', email: 'creep@example.com', plan: 'DIRT', servers: 1, joined: '2024-05-01', status: 'banned', spent: '₹99' },
  { id: 4, username: 'PixelKing_Zoe', email: 'zoe@example.com', plan: 'IRON', servers: 1, joined: '2024-03-10', status: 'active', spent: '₹716' },
  { id: 5, username: 'NetheriteGod', email: 'nether@example.com', plan: 'NETHERITE', servers: 4, joined: '2024-01-02', status: 'active', spent: '₹11,988' },
  { id: 6, username: 'LazyAdmin', email: 'lazy@example.com', plan: 'DIAMOND', servers: 1, joined: '2024-04-20', status: 'suspended', spent: '₹698' },
]

const planColors: Record<string, string> = {
  DIRT: 'text-mc-stone border-gray-700',
  IRON: 'text-gray-300 border-gray-600',
  DIAMOND: 'text-mc-diamond border-teal-800',
  NETHERITE: 'text-mc-gold border-yellow-800',
}

const statusColors: Record<string, string> = {
  active: 'text-mc-emerald border-green-800',
  banned: 'text-mc-redstone border-red-800',
  suspended: 'text-mc-gold border-yellow-800',
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [userList, setUserList] = useState(users)
  const [selectedUser, setSelectedUser] = useState<typeof users[0] | null>(null)

  const filtered = userList.filter(u => {
    const matchSearch = u.username.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || u.status === filter
    return matchSearch && matchFilter
  })

  const banUser = (id: number) => {
    setUserList(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'banned' ? 'active' : 'banned' } : u))
    setSelectedUser(null)
  }

  const deleteUser = (id: number) => {
    setUserList(prev => prev.filter(u => u.id !== id))
    setSelectedUser(null)
  }

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      <DashboardHeader title="User Management" />
      <div className="p-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search by username or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="mc-input pl-9 w-full"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all', 'active', 'banned', 'suspended'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 text-xs font-mono uppercase border transition-all ${
                  filter === f ? 'border-mc-diamond text-mc-diamond bg-mc-diamond/5' : 'border-mc-card-border text-gray-500 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Total Users', value: userList.length, color: 'text-white' },
            { label: 'Active', value: userList.filter(u => u.status === 'active').length, color: 'text-mc-emerald' },
            { label: 'Banned/Suspended', value: userList.filter(u => u.status !== 'active').length, color: 'text-mc-redstone' },
          ].map(({ label, value, color }) => (
            <div key={label} className="mc-card p-3 text-center">
              <div className={`text-xl font-body font-bold ${color}`}>{value}</div>
              <div className="text-gray-500 text-xs font-mono">{label}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mc-card border border-mc-card-border overflow-x-auto">
          <table className="w-full text-sm font-body min-w-[700px]">
            <thead>
              <tr className="border-b border-mc-card-border text-left">
                {['User', 'Email', 'Plan', 'Servers', 'Joined', 'Spent', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-xs font-mono text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-mc-card-border">
              {filtered.map((user, i) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="hover:bg-mc-hover-bg transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-mc-grass/10 border border-mc-grass/20 flex items-center justify-center text-xs font-mono text-mc-grass pixel-art flex-shrink-0">
                        {user.username[0]}
                      </div>
                      <span className="text-white font-medium whitespace-nowrap">{user.username}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs whitespace-nowrap">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`mc-badge text-xs ${planColors[user.plan]}`}>{user.plan}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-center">{user.servers}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs font-mono whitespace-nowrap">{user.joined}</td>
                  <td className="px-4 py-3 text-mc-gold font-mono text-xs whitespace-nowrap">{user.spent}</td>
                  <td className="px-4 py-3">
                    <span className={`mc-badge text-xs ${statusColors[user.status]}`}>{user.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => setSelectedUser(user)} className="p-1.5 text-gray-500 hover:text-mc-diamond transition-colors" title="View">
                        <Eye size={13} />
                      </button>
                      <button onClick={() => banUser(user.id)} className={`p-1.5 transition-colors ${user.status === 'banned' ? 'text-mc-grass' : 'text-mc-gold'}`} title={user.status === 'banned' ? 'Unban' : 'Ban'}>
                        {user.status === 'banned' ? <UserCheck size={13} /> : <Ban size={13} />}
                      </button>
                      <button onClick={() => deleteUser(user.id)} className="p-1.5 text-gray-500 hover:text-mc-redstone transition-colors" title="Delete">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-gray-600 font-mono text-sm">No users found.</div>
          )}
        </motion.div>

        {/* Modal */}
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setSelectedUser(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={e => e.stopPropagation()}
              className="mc-card border border-mc-card-border p-6 w-full max-w-md mx-4"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-mc-grass/10 border-2 border-mc-grass/20 flex items-center justify-center text-2xl font-mono text-mc-grass pixel-art">
                  {selectedUser.username[0]}
                </div>
                <div>
                  <h3 className="text-white font-body font-bold text-lg">{selectedUser.username}</h3>
                  <p className="text-gray-500 text-sm font-mono">{selectedUser.email}</p>
                </div>
              </div>
              <div className="space-y-2 mb-6">
                {[
                  ['Plan', selectedUser.plan],
                  ['Active Servers', selectedUser.servers],
                  ['Total Spent', selectedUser.spent],
                  ['Joined', selectedUser.joined],
                  ['Status', selectedUser.status],
                ].map(([k, v]) => (
                  <div key={String(k)} className="flex justify-between py-2 border-b border-mc-card-border text-sm">
                    <span className="text-gray-500 font-body">{k}</span>
                    <span className="text-white font-mono">{v}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => banUser(selectedUser.id)} className="flex-1 py-2 text-xs uppercase border border-mc-gold/40 text-mc-gold hover:bg-mc-gold/10 transition-all font-body">
                  {selectedUser.status === 'banned' ? 'Unban User' : 'Ban User'}
                </button>
                <button onClick={() => deleteUser(selectedUser.id)} className="flex-1 py-2 text-xs uppercase border border-mc-redstone/40 text-mc-redstone hover:bg-mc-redstone/10 transition-all font-body">
                  Delete User
                </button>
                <button onClick={() => setSelectedUser(null)} className="px-4 py-2 text-xs text-gray-500 border border-mc-card-border hover:text-white transition-all">
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
