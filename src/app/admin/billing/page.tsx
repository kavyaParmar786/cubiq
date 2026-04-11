'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import DashboardHeader from '@/components/layout/DashboardHeader'
import { Download, RefreshCw, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useAdminGuard } from '@/lib/useAdmin'

const STATUS_COLORS: Record<string, string> = {
  paid: 'text-mc-emerald border-green-800',
  pending: 'text-mc-gold border-yellow-800',
  failed: 'text-mc-redstone border-red-800',
  refunded: 'text-gray-400 border-gray-700',
}

export default function AdminBillingPage() {
  const { isAdmin, loading: authLoading } = useAdminGuard()
  const [payments, setPayments] = useState<any[]>([])
  const [stats, setStats] = useState({ mrr: 0, total: 0, pending: 0, count: 0 })
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const supabase = createClient()

  useEffect(() => {
    if (!isAdmin) return
    loadPayments()
  }, [isAdmin, statusFilter])

  async function loadPayments() {
    setLoading(true)
    let q = supabase
      .from('payments')
      .select('*, profiles(username, email), plans(name, display_name)')
      .order('created_at', { ascending: false })
      .limit(100)
    if (statusFilter !== 'all') q = q.eq('status', statusFilter)
    const { data } = await q
    const all = data || []
    setPayments(all)

    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const mrr = all.filter(p => p.status === 'paid' && new Date(p.created_at) >= monthStart)
      .reduce((a: number, p: any) => a + p.amount, 0)
    const total = all.filter((p: any) => p.status === 'paid').reduce((a: number, p: any) => a + p.amount, 0)
    const pending = all.filter((p: any) => p.status === 'pending').reduce((a: number, p: any) => a + p.amount, 0)
    setStats({ mrr: mrr / 100, total: total / 100, pending: pending / 100, count: all.length })
    setLoading(false)
  }

  const refundPayment = async (id: string) => {
    if (!confirm('Mark this payment as refunded?')) return
    await supabase.from('payments').update({ status: 'refunded' }).eq('id', id)
    setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'refunded' } : p))
  }

  if (authLoading || !isAdmin) return null

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      <DashboardHeader title="Billing Control" />
      <div className="p-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'MRR (This Month)', value: `₹${stats.mrr.toLocaleString()}`, color: 'text-mc-diamond' },
            { label: 'Total Revenue', value: `₹${stats.total.toLocaleString()}`, color: 'text-mc-gold' },
            { label: 'Pending', value: `₹${stats.pending.toLocaleString()}`, color: 'text-mc-gold' },
            { label: 'Transactions', value: String(stats.count), color: 'text-white' },
          ].map(({ label, value, color }) => (
            <div key={label} className="mc-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={12} className="text-mc-grass" />
              </div>
              <p className="text-gray-500 text-xs font-mono uppercase mb-1">{label}</p>
              <p className={`text-xl font-body font-bold ${color}`}>{loading ? '...' : value}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-4 flex-wrap items-center">
          {['all', 'paid', 'pending', 'failed', 'refunded'].map(f => (
            <button key={f} onClick={() => setStatusFilter(f)}
              className={`px-4 py-2 text-xs font-mono uppercase border transition-all ${statusFilter === f ? 'border-mc-diamond text-mc-diamond bg-mc-diamond/5' : 'border-mc-card-border text-gray-500 hover:text-white'}`}>
              {f}
            </button>
          ))}
          <button onClick={loadPayments} className="px-3 py-2 border border-mc-card-border text-gray-500 hover:text-white transition-all ml-auto">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mc-card border border-mc-card-border overflow-x-auto">
          <table className="w-full text-sm font-body min-w-[700px]">
            <thead>
              <tr className="border-b border-mc-card-border text-left">
                {['Invoice', 'User', 'Plan', 'Amount', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-xs font-mono text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-mc-card-border">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-600 font-mono text-sm">Loading...</td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-600 font-mono text-sm">No payments found.</td></tr>
              ) : payments.map((pay, i) => (
                <motion.tr key={pay.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="hover:bg-mc-hover-bg transition-colors">
                  <td className="px-4 py-3 text-xs font-mono text-gray-400">{pay.invoice_id || pay.id.slice(0, 8)}</td>
                  <td className="px-4 py-3">
                    <div className="text-white text-sm">{pay.profiles?.username || '—'}</div>
                    <div className="text-gray-600 text-xs font-mono">{pay.profiles?.email}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-300 text-xs">{pay.plans?.display_name || pay.description || '—'}</td>
                  <td className="px-4 py-3 text-mc-gold font-body font-bold">₹{(pay.amount / 100).toFixed(0)}</td>
                  <td className="px-4 py-3">
                    <span className={`mc-badge text-xs ${STATUS_COLORS[pay.status] || STATUS_COLORS.pending}`}>{pay.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs font-mono whitespace-nowrap">
                    {new Date(pay.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button className="p-1.5 text-gray-500 hover:text-mc-diamond transition-colors" title="Invoice">
                        <Download size={13} />
                      </button>
                      {pay.status === 'paid' && (
                        <button onClick={() => refundPayment(pay.id)}
                          className="px-2 py-1 text-xs border border-mc-redstone/30 text-mc-redstone hover:bg-mc-redstone/10 transition-all uppercase">
                          Refund
                        </button>
                      )}
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
