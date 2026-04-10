'use client'

import { motion } from 'framer-motion'
import DashboardHeader from '@/components/layout/DashboardHeader'
import { Users, Server, CreditCard, Ticket, TrendingUp, Activity, AlertTriangle } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'

const revenueData = [
  { month: 'Jan', revenue: 24500 },
  { month: 'Feb', revenue: 31200 },
  { month: 'Mar', revenue: 28900 },
  { month: 'Apr', revenue: 35600 },
  { month: 'May', revenue: 42100 },
  { month: 'Jun', revenue: 38750 },
]

const signupsData = [
  { day: 'Mon', users: 12 },
  { day: 'Tue', users: 19 },
  { day: 'Wed', users: 8 },
  { day: 'Thu', users: 24 },
  { day: 'Fri', users: 31 },
  { day: 'Sat', users: 17 },
  { day: 'Sun', users: 9 },
]

const recentActivity = [
  { type: 'user', msg: 'New user registered: alex_builder@gmail.com', time: '2m ago', color: 'text-mc-grass' },
  { type: 'server', msg: 'Server "SkyblockNetwork" deployed — NETHERITE plan', time: '8m ago', color: 'text-mc-diamond' },
  { type: 'payment', msg: 'Payment received ₹999 from user #4821', time: '15m ago', color: 'text-mc-gold' },
  { type: 'ticket', msg: 'New support ticket #TKT-047 opened (High priority)', time: '22m ago', color: 'text-mc-redstone' },
  { type: 'server', msg: 'Server "TestSMP" suspended — payment failed', time: '1h ago', color: 'text-mc-gold' },
]

export default function AdminDashboard() {
  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      <DashboardHeader title="Admin Dashboard" />
      <div className="p-6 flex flex-col gap-6">

        {/* Alert banner */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mc-card p-4 border border-mc-gold/30 bg-mc-gold/5 flex items-center gap-3">
          <AlertTriangle size={16} className="text-mc-gold flex-shrink-0" />
          <p className="text-mc-gold text-sm font-body">EU West node experiencing elevated latency. <span className="underline cursor-pointer">View incident →</span></p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Users, label: 'Total Users', value: '4,827', sub: '+124 this week', color: 'text-mc-grass', border: 'border-mc-grass/20' },
            { icon: Server, label: 'Active Servers', value: '1,203', sub: '97 bots', color: 'text-mc-diamond', border: 'border-mc-diamond/20' },
            { icon: CreditCard, label: 'MRR', value: '₹3,87,500', sub: '+12.4% MoM', color: 'text-mc-gold', border: 'border-mc-gold/20' },
            { icon: Ticket, label: 'Open Tickets', value: '23', sub: '5 high priority', color: 'text-mc-redstone', border: 'border-mc-redstone/20' },
          ].map(({ icon: Icon, label, value, sub, color, border }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className={`mc-card p-5 border ${border}`}
            >
              <div className="flex items-start justify-between mb-3">
                <p className="text-gray-500 text-xs font-mono uppercase tracking-wider">{label}</p>
                <Icon size={16} className={color} />
              </div>
              <p className={`text-xl font-body font-bold ${color}`}>{value}</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp size={10} className="text-mc-emerald" />
                <p className="text-gray-600 text-xs font-mono">{sub}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mc-card p-5">
            <h3 className="text-gray-400 text-xs font-mono uppercase tracking-wider mb-4">Monthly Revenue (₹)</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={revenueData}>
                <XAxis dataKey="month" tick={{ fill: '#555', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ background: '#141420', border: '1px solid #2A2A3E', borderRadius: 0, fontSize: 11 }} formatter={(v: any) => [`₹${v.toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#4EEBD0" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="mc-card p-5">
            <h3 className="text-gray-400 text-xs font-mono uppercase tracking-wider mb-4">New Signups (This Week)</h3>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={signupsData}>
                <XAxis dataKey="day" tick={{ fill: '#555', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ background: '#141420', border: '1px solid #2A2A3E', borderRadius: 0, fontSize: 11 }} />
                <Line type="monotone" dataKey="users" stroke="#5D9E2F" strokeWidth={2} dot={{ fill: '#5D9E2F', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Activity Feed */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mc-card border border-mc-card-border">
          <div className="px-6 py-4 border-b border-mc-card-border flex items-center gap-2">
            <Activity size={14} className="text-mc-diamond" />
            <h3 className="text-white font-body font-semibold text-sm uppercase tracking-wider">Live Activity</h3>
          </div>
          <div className="divide-y divide-mc-card-border">
            {recentActivity.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.05 }}
                className="flex items-center justify-between px-6 py-3 hover:bg-mc-hover-bg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-1.5 h-1.5 flex-shrink-0 ${item.color.replace('text-', 'bg-')}`} />
                  <p className={`text-sm font-body ${item.color}`}>{item.msg}</p>
                </div>
                <span className="text-gray-600 text-xs font-mono flex-shrink-0">{item.time}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
