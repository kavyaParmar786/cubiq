'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import DashboardHeader from '@/components/layout/DashboardHeader'
import { Search, CheckCircle, XCircle, Download, TrendingUp } from 'lucide-react'

const transactions = [
  { id: 'TXN-001', user: 'Steve_Miner', email: 'steve@example.com', plan: 'DIAMOND', amount: 349, date: '2024-06-01 14:23', method: 'UPI', status: 'success', invoice: 'INV-2024-006' },
  { id: 'TXN-002', user: 'AlexBuilder', email: 'alex@example.com', plan: 'NETHERITE', amount: 999, date: '2024-06-01 11:05', method: 'Card', status: 'success', invoice: 'INV-2024-007' },
  { id: 'TXN-003', user: 'PixelQueen', email: 'pixel@mc.net', plan: 'DIAMOND', amount: 349, date: '2024-06-02 09:44', method: 'UPI', status: 'failed', invoice: '—' },
  { id: 'TXN-004', user: 'DevBot_Riya', email: 'riya@dev.io', plan: 'BOT PRO', amount: 149, date: '2024-06-03 16:20', method: 'Wallet', status: 'success', invoice: 'INV-2024-008' },
  { id: 'TXN-005', user: 'NetworkDev', email: 'net@dev.com', plan: 'NETHERITE', amount: 999, date: '2024-06-04 08:11', method: 'NetBanking', status: 'success', invoice: 'INV-2024-009' },
  { id: 'TXN-006', user: 'LegacySMP', email: 'legacy@smp.gg', plan: 'IRON', amount: 179, date: '2024-06-05 12:30', method: 'Card', status: 'pending', invoice: '—' },
]

const statusStyles: Record<string, string> = {
  success: 'text-mc-emerald border-green-800',
  failed: 'text-mc-redstone border-red-800',
  pending: 'text-mc-gold border-yellow-800',
}

const StatusIcon = ({ status }: { status: string }) => {
  if (status === 'success') return <CheckCircle size={14} className="text-mc-emerald" />
  if (status === 'failed') return <XCircle size={14} className="text-mc-redstone" />
  return <div className="w-3.5 h-3.5 border-2 border-mc-gold border-t-transparent animate-spin rounded-full" />
}

export default function AdminBillingPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = transactions.filter(t => {
    const matchSearch = t.user.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || t.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalRevenue = transactions.filter(t => t.status === 'success').reduce((sum, t) => sum + t.amount, 0)
  const pendingRevenue = transactions.filter(t => t.status === 'pending').reduce((sum, t) => sum + t.amount, 0)

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      <DashboardHeader title="Billing Control" />
      <div className="p-6">

        {/* Revenue cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Today's Revenue", value: `₹${(1347).toLocaleString()}`, color: 'text-mc-diamond', icon: TrendingUp },
            { label: 'Month Revenue', value: `₹${(38750).toLocaleString()}`, color: 'text-mc-gold', icon: TrendingUp },
            { label: 'Successful', value: transactions.filter(t => t.status === 'success').length, color: 'text-mc-emerald', icon: CheckCircle },
            { label: 'Failed / Pending', value: transactions.filter(t => t.status !== 'success').length, color: 'text-mc-redstone', icon: XCircle },
          ].map(({ label, value, color, icon: Icon }) => (
            <motion.div key={label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mc-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 text-xs font-mono uppercase">{label}</span>
                <Icon size={14} className={color} />
              </div>
              <div className={`font-body font-bold text-xl ${color}`}>{value}</div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search by user or transaction ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="mc-input pl-9 pr-4 py-2.5 text-sm"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'success', 'failed', 'pending'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 text-xs font-mono uppercase border transition-all ${
                  statusFilter === s ? 'border-mc-diamond text-mc-diamond bg-mc-diamond/5' : 'border-mc-card-border text-gray-500 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions Table */}
        <div className="mc-card border border-mc-card-border overflow-x-auto">
          <table className="w-full text-sm min-w-[750px]">
            <thead>
              <tr className="border-b border-mc-card-border">
                {['Transaction', 'User', 'Plan', 'Amount', 'Method', 'Date', 'Status', 'Invoice'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-mono uppercase tracking-wider text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-mc-card-border">
              {filtered.map((txn, i) => (
                <motion.tr
                  key={txn.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="hover:bg-mc-hover-bg transition-colors"
                >
                  <td className="px-4 py-3 text-mc-diamond text-xs font-mono">{txn.id}</td>
                  <td className="px-4 py-3">
                    <div className="text-white font-body font-medium text-sm">{txn.user}</div>
                    <div className="text-gray-500 text-xs">{txn.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="mc-badge text-mc-diamond border-teal-800 text-xs">{txn.plan}</span>
                  </td>
                  <td className="px-4 py-3 text-mc-gold font-body font-bold">₹{txn.amount}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs font-mono">{txn.method}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs font-mono">{txn.date}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <StatusIcon status={txn.status} />
                      <span className={`mc-badge text-xs ${statusStyles[txn.status]}`}>{txn.status}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {txn.invoice !== '—' ? (
                      <button className="text-mc-diamond text-xs font-mono hover:underline flex items-center gap-1">
                        <Download size={11} /> {txn.invoice}
                      </button>
                    ) : (
                      <span className="text-gray-600 text-xs font-mono">—</span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
