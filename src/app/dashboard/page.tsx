'use client'

import { motion } from 'framer-motion'
import DashboardHeader from '@/components/layout/DashboardHeader'
import { Server, CreditCard, Ticket, Cpu, MemoryStick, Zap, ArrowUpRight, Activity } from 'lucide-react'
import Link from 'next/link'
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis } from 'recharts'

// Mock data
const cpuData = Array.from({ length: 20 }, (_, i) => ({ t: i, v: Math.floor(20 + Math.random() * 40) }))
const ramData = Array.from({ length: 20 }, (_, i) => ({ t: i, v: Math.floor(40 + Math.random() * 30) }))

const servers = [
  { name: 'SurvivalSMP', type: 'Paper 1.20.4', status: 'online', players: '12/20', ram: '2.1GB', cpu: '34%' },
  { name: 'CreativePlot', type: 'Paper 1.20.4', status: 'online', players: '3/10', ram: '0.8GB', cpu: '12%' },
  { name: 'TestServer', type: 'Vanilla 1.19.4', status: 'offline', players: '0/5', ram: '0GB', cpu: '0%' },
]

const StatCard = ({ icon: Icon, label, value, sub, color }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="mc-card p-5 flex items-start justify-between"
  >
    <div>
      <p className="text-gray-500 text-xs font-mono uppercase tracking-wider mb-1">{label}</p>
      <p className="text-white text-2xl font-body font-bold">{value}</p>
      {sub && <p className="text-gray-600 text-xs font-mono mt-1">{sub}</p>}
    </div>
    <div className={`p-2.5 border border-mc-card-border ${color}`}>
      <Icon size={20} />
    </div>
  </motion.div>
)

export default function DashboardPage() {
  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      <DashboardHeader title="Overview" />

      <div className="p-6 flex flex-col gap-6">
        {/* Welcome banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mc-card p-5 border border-mc-grass/20 bg-gradient-to-r from-mc-grass/5 to-transparent flex items-center justify-between"
        >
          <div>
            <h2 className="text-white font-body font-semibold text-base">Welcome back, <span className="text-mc-grass">Steve!</span> 👋</h2>
            <p className="text-gray-500 text-sm font-body mt-1">You have 3 servers running. All systems normal.</p>
          </div>
          <Link href="/dashboard/servers/create" className="mc-btn text-xs px-4 py-2 flex items-center gap-2 hidden sm:flex">
            <Zap size={12} /> New Server
          </Link>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Server, label: 'Active Servers', value: '2', sub: '1 offline', color: 'text-mc-grass' },
            { icon: Activity, label: 'Avg CPU Usage', value: '23%', sub: 'Across all servers', color: 'text-mc-diamond' },
            { icon: MemoryStick, label: 'RAM In Use', value: '2.9GB', sub: 'of 6GB allocated', color: 'text-mc-gold' },
            { icon: Ticket, label: 'Open Tickets', value: '1', sub: 'Awaiting reply', color: 'text-mc-redstone' },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <StatCard {...stat} />
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[
            { label: 'CPU Usage (24h)', data: cpuData, color: '#4EEBD0', unit: '%' },
            { label: 'RAM Usage (24h)', data: ramData, color: '#FFD700', unit: '%' },
          ].map(({ label, data, color, unit }) => (
            <motion.div key={label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mc-card p-5">
              <h3 className="text-gray-400 text-xs font-mono uppercase tracking-wider mb-4">{label}</h3>
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={data}>
                  <XAxis dataKey="t" hide />
                  <Tooltip
                    contentStyle={{ background: '#141420', border: '1px solid #2A2A3E', borderRadius: 0, fontSize: 11 }}
                    formatter={(v: any) => [`${v}${unit}`, '']}
                  />
                  <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          ))}
        </div>

        {/* Servers List */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mc-card">
          <div className="px-6 py-4 border-b border-mc-card-border flex items-center justify-between">
            <h3 className="text-white font-body font-semibold text-sm uppercase tracking-wider">My Servers</h3>
            <Link href="/dashboard/servers" className="text-mc-diamond text-xs font-mono hover:underline flex items-center gap-1">
              View all <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-mc-card-border">
            {servers.map((srv) => (
              <div key={srv.name} className="px-6 py-4 flex items-center justify-between hover:bg-mc-hover-bg transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`status-${srv.status}`}>{srv.status}</div>
                  <div>
                    <p className="text-white font-body font-medium text-sm">{srv.name}</p>
                    <p className="text-gray-600 text-xs font-mono">{srv.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-xs font-mono text-gray-500">
                  <span>👥 {srv.players}</span>
                  <span>🖥️ {srv.cpu}</span>
                  <span>💾 {srv.ram}</span>
                  <Link href={`/dashboard/servers/${srv.name.toLowerCase()}`} className="mc-btn-diamond px-3 py-1 text-xs">
                    Manage
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Create Server', href: '/dashboard/servers/create', icon: Server, color: 'border-mc-grass/30 hover:border-mc-grass/60' },
            { label: 'Billing', href: '/dashboard/billing', icon: CreditCard, color: 'border-mc-diamond/30 hover:border-mc-diamond/60' },
            { label: 'Support', href: '/dashboard/tickets', icon: Ticket, color: 'border-mc-gold/30 hover:border-mc-gold/60' },
            { label: 'Bot Hosting', href: '/dashboard/bots', icon: Cpu, color: 'border-mc-redstone/30 hover:border-mc-redstone/60' },
          ].map(({ label, href, icon: Icon, color }) => (
            <Link
              key={label}
              href={href}
              className={`mc-card p-4 border transition-all duration-200 flex flex-col items-center gap-2 text-center hover:bg-mc-hover-bg ${color}`}
            >
              <Icon size={20} className="text-gray-400" />
              <span className="text-gray-300 text-xs font-body font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
