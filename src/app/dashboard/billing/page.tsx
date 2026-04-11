'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import DashboardHeader from '@/components/layout/DashboardHeader'
import { CreditCard, Download, Zap, Star, Check } from 'lucide-react'
import Link from 'next/link'
import { createClient, type Payment, type Plan } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'

export default function BillingPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState<'overview' | 'invoices' | 'payment'>('overview')
  const [payments, setPayments] = useState<Payment[]>([])
  const [activeServers, setActiveServers] = useState<any[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!user) return
    Promise.all([
      supabase.from('payments').select('*, plans(name, display_name)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
      supabase.from('servers').select('*, plans(name, display_name, price)').eq('user_id', user.id).neq('status', 'deleted'),
      supabase.from('plans').select('*').eq('is_active', true).order('sort_order').limit(5),
    ]).then(([pRes, sRes, plRes]) => {
      setPayments(pRes.data || [])
      setActiveServers(sRes.data || [])
      setPlans(plRes.data || [])
      setLoading(false)
    })
  }, [user])

  const monthlyTotal = activeServers.reduce((acc, s) => acc + (s.plans?.price || 0), 0)
  const totalPaid = payments.filter(p => p.status === 'paid').reduce((acc, p) => acc + p.amount, 0)

  if (loading) return (
    <div className="flex flex-col flex-1"><DashboardHeader title="Billing" />
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500 font-mono text-sm animate-pulse">Loading billing...</p>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      <DashboardHeader title="Billing" />
      <div className="p-6">
        <div className="flex border-b border-mc-card-border mb-6">
          {[{ id: 'overview', label: 'Overview' }, { id: 'invoices', label: 'Invoices' }, { id: 'payment', label: 'Payment Methods' }].map(({ id, label }) => (
            <button key={id} onClick={() => setTab(id as any)}
              className={`px-5 py-3 text-sm font-body uppercase tracking-wider transition-all border-b-2 -mb-px ${tab === id ? 'text-mc-diamond border-mc-diamond' : 'text-gray-500 border-transparent hover:text-white'}`}>
              {label}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Monthly Total', value: `₹${monthlyTotal}`, sub: 'Next billing: 1st of next month', color: 'text-mc-diamond' },
                { label: 'Active Servers', value: String(activeServers.length), sub: 'Currently deployed', color: 'text-mc-grass' },
                { label: 'Total Paid', value: `₹${totalPaid}`, sub: 'All-time payments', color: 'text-mc-gold' },
              ].map(({ label, value, sub, color }) => (
                <div key={label} className="mc-card p-5">
                  <p className="text-gray-500 text-xs font-mono uppercase tracking-wider mb-1">{label}</p>
                  <p className={`text-2xl font-body font-bold ${color}`}>{value}</p>
                  <p className="text-gray-600 text-xs font-mono mt-1">{sub}</p>
                </div>
              ))}
            </div>

            {/* Active Plans */}
            {activeServers.length > 0 && (
              <div className="mc-card border border-mc-card-border">
                <div className="px-6 py-4 border-b border-mc-card-border">
                  <h3 className="text-white font-body font-semibold uppercase tracking-wider text-sm">Active Plans</h3>
                </div>
                <div className="divide-y divide-mc-card-border">
                  {activeServers.map(srv => (
                    <div key={srv.id} className="flex items-center justify-between px-6 py-4 hover:bg-mc-hover-bg transition-colors">
                      <div>
                        <p className="text-white font-body font-medium text-sm">{srv.name}</p>
                        <p className="text-gray-500 text-xs font-mono mt-0.5">{srv.plans?.display_name} Plan · Status: {srv.status}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-white font-body font-bold">₹{srv.plans?.price}<span className="text-gray-500 text-xs font-normal">/mo</span></span>
                        <Link href="/pricing" className="text-mc-diamond text-xs font-mono hover:underline">Upgrade</Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upgrade CTA */}
            <div className="mc-card p-6 border border-mc-gold/20 bg-gradient-to-r from-mc-gold/5 to-transparent flex items-center justify-between">
              <div>
                <p className="text-white font-body font-bold text-base mb-1 flex items-center gap-2">
                  <Star size={16} className="text-mc-gold" /> Need more power?
                </p>
                <p className="text-gray-400 text-sm font-body">Upgrade your server plan anytime — data preserved.</p>
              </div>
              <Link href="/pricing" className="mc-btn text-xs px-6 py-3 flex items-center gap-2 flex-shrink-0">
                <Zap size={12} /> View Plans
              </Link>
            </div>
          </motion.div>
        )}

        {tab === 'invoices' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {payments.length === 0 ? (
              <div className="mc-card p-12 text-center border border-mc-card-border text-gray-600 text-sm font-body">
                No payment history yet.
              </div>
            ) : (
              <div className="mc-card border border-mc-card-border">
                <div className="divide-y divide-mc-card-border">
                  {payments.map((inv, i) => (
                    <motion.div key={inv.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                      className="flex items-center justify-between px-6 py-4 hover:bg-mc-hover-bg transition-colors">
                      <div>
                        <p className="text-white font-body font-medium text-sm">{inv.description || (inv as any).plans?.display_name || 'Payment'}</p>
                        <p className="text-gray-500 text-xs font-mono mt-0.5">{inv.invoice_id || inv.id.slice(0, 8)} · {new Date(inv.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-white font-body font-bold">₹{inv.amount}</span>
                        <span className={`mc-badge text-xs ${inv.status === 'paid' ? 'text-mc-emerald border-green-800' : inv.status === 'pending' ? 'text-mc-gold border-yellow-800' : 'text-mc-redstone border-red-800'}`}>
                          {inv.status}
                        </span>
                        <button className="text-gray-500 hover:text-mc-diamond transition-colors" title="Download invoice">
                          <Download size={14} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {tab === 'payment' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="mc-card p-5 border border-mc-card-border flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-8 bg-mc-card-border border border-mc-card-border flex items-center justify-center">
                  <CreditCard size={18} className="text-mc-diamond" />
                </div>
                <div>
                  <p className="text-white font-body font-medium text-sm">Razorpay (UPI / Card / NetBanking)</p>
                  <p className="text-gray-500 text-xs font-mono">Secure payment processed at checkout</p>
                </div>
                <span className="mc-badge text-mc-grass border-green-800 text-xs"><Check size={10} className="inline mr-1" />Active</span>
              </div>
            </div>
            <p className="text-gray-600 text-xs font-mono">Payments are processed securely via Razorpay. Cubiq Host does not store card details.</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
