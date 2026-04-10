'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import DashboardHeader from '@/components/layout/DashboardHeader'
import { CreditCard, Download, Zap, Star, Check } from 'lucide-react'
import Link from 'next/link'

const invoices = [
  { id: 'INV-2024-006', date: '2024-06-01', desc: 'DIAMOND Plan - SurvivalSMP', amount: 349, status: 'paid' },
  { id: 'INV-2024-005', date: '2024-06-01', desc: 'IRON Plan - CreativePlot', amount: 179, status: 'paid' },
  { id: 'INV-2024-004', date: '2024-05-01', desc: 'DIAMOND Plan - SurvivalSMP', amount: 349, status: 'paid' },
  { id: 'INV-2024-003', date: '2024-05-01', desc: 'IRON Plan - CreativePlot', amount: 179, status: 'paid' },
]

const paymentMethods = [
  { id: 'pm1', type: 'card', last4: '4242', brand: 'Visa', expires: '12/2026', default: true },
]

export default function BillingPage() {
  const [tab, setTab] = useState<'overview' | 'invoices' | 'payment'>('overview')

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      <DashboardHeader title="Billing" />
      <div className="p-6">

        {/* Tabs */}
        <div className="flex border-b border-mc-card-border mb-6">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'invoices', label: 'Invoices' },
            { id: 'payment', label: 'Payment Methods' },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setTab(id as any)}
              className={`px-5 py-3 text-sm font-body uppercase tracking-wider transition-all border-b-2 -mb-px ${
                tab === id ? 'text-mc-diamond border-mc-diamond' : 'text-gray-500 border-transparent hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Monthly Total', value: '₹528', sub: 'Next billing: Jul 1, 2024', color: 'text-mc-diamond' },
                { label: 'Active Servers', value: '2', sub: 'DIAMOND + IRON plans', color: 'text-mc-grass' },
                { label: 'Total Paid', value: '₹2,112', sub: 'Since account creation', color: 'text-mc-gold' },
              ].map(({ label, value, sub, color }) => (
                <div key={label} className="mc-card p-5">
                  <p className="text-gray-500 text-xs font-mono uppercase tracking-wider mb-1">{label}</p>
                  <p className={`text-2xl font-body font-bold ${color}`}>{value}</p>
                  <p className="text-gray-600 text-xs font-mono mt-1">{sub}</p>
                </div>
              ))}
            </div>

            {/* Active Plans */}
            <div className="mc-card border border-mc-card-border">
              <div className="px-6 py-4 border-b border-mc-card-border">
                <h3 className="text-white font-body font-semibold uppercase tracking-wider text-sm">Active Plans</h3>
              </div>
              <div className="divide-y divide-mc-card-border">
                {[
                  { name: 'SurvivalSMP', plan: 'DIAMOND', price: 349, nextBill: 'Jul 1, 2024' },
                  { name: 'CreativePlot', plan: 'IRON', price: 179, nextBill: 'Jul 1, 2024' },
                ].map((item) => (
                  <div key={item.name} className="px-6 py-4 flex items-center justify-between">
                    <div>
                      <p className="text-white font-body font-medium text-sm">{item.name}</p>
                      <p className="text-gray-500 text-xs font-mono mt-0.5">{item.plan} Plan · Renews {item.nextBill}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-white font-body font-bold">₹{item.price}<span className="text-gray-500 text-xs font-normal">/mo</span></span>
                      <Link href="/pricing" className="text-mc-diamond text-xs font-mono hover:underline">Upgrade</Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upgrade CTA */}
            <div className="mc-card p-6 border border-mc-gold/20 bg-gradient-to-r from-mc-gold/5 to-transparent flex items-center justify-between">
              <div>
                <p className="text-white font-body font-bold text-base mb-1 flex items-center gap-2">
                  <Star size={16} className="text-mc-gold" /> Upgrade to NETHERITE
                </p>
                <p className="text-gray-400 text-sm font-body">Get 16GB RAM, 4 vCores, unlimited players — ₹999/mo</p>
              </div>
              <Link href="/pricing" className="mc-btn text-xs px-6 py-3 flex items-center gap-2 flex-shrink-0">
                <Zap size={12} /> Upgrade
              </Link>
            </div>
          </motion.div>
        )}

        {tab === 'invoices' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mc-card border border-mc-card-border">
            <div className="divide-y divide-mc-card-border">
              {invoices.map((inv, i) => (
                <motion.div key={inv.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between px-6 py-4 hover:bg-mc-hover-bg transition-colors"
                >
                  <div>
                    <p className="text-white font-body font-medium text-sm">{inv.desc}</p>
                    <p className="text-gray-500 text-xs font-mono mt-0.5">{inv.id} · {inv.date}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-white font-body font-bold">₹{inv.amount}</span>
                    <span className={`mc-badge text-xs ${inv.status === 'paid' ? 'text-mc-emerald border-green-800' : 'text-mc-redstone border-red-800'}`}>
                      {inv.status}
                    </span>
                    <button className="text-gray-500 hover:text-mc-diamond transition-colors">
                      <Download size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {tab === 'payment' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {paymentMethods.map((pm) => (
              <div key={pm.id} className="mc-card p-5 border border-mc-card-border flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-8 bg-mc-card-border border border-mc-card-border flex items-center justify-center">
                    <CreditCard size={18} className="text-mc-diamond" />
                  </div>
                  <div>
                    <p className="text-white font-body font-medium text-sm">{pm.brand} ending in {pm.last4}</p>
                    <p className="text-gray-500 text-xs font-mono">Expires {pm.expires}</p>
                  </div>
                  {pm.default && <span className="mc-badge text-mc-grass border-green-800 text-xs"><Check size={10} className="inline mr-1" />Default</span>}
                </div>
                <button className="text-mc-redstone text-xs font-mono hover:underline">Remove</button>
              </div>
            ))}
            <button className="border-2 border-dashed border-mc-card-border text-gray-500 hover:border-mc-diamond hover:text-mc-diamond transition-all py-4 w-full text-sm font-body flex items-center justify-center gap-2">
              <CreditCard size={16} /> Add Payment Method
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
