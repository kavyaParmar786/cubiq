'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import DashboardHeader from '@/components/layout/DashboardHeader'
import { Users, Server, CreditCard, Ticket, TrendingUp, Activity } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, ResponsiveContainer, XAxis, Tooltip } from 'recharts'
import { createClient } from '@/lib/supabase'
import { useAdminGuard } from '@/lib/useAdmin'

interface Stats { totalUsers: number; activeServers: number; openTickets: number; mrr: number; newUsersThisMonth: number }

export default function AdminDashboard() {
  const { isAdmin, loading: authLoading } = useAdminGuard()
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, activeServers: 0, openTickets: 0, mrr: 0, newUsersThisMonth: 0 })
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [weeklySignups, setWeeklySignups] = useState<{ day: string; users: number }[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!isAdmin) return
    loadData()
  }, [isAdmin])

  async function loadData() {
    // Stats
    const res = await fetch('/api/admin')
    if (res.ok) setStats(await res.json())

    // Recent profiles (activity feed)
    const { data: recentUsers } = await supabase
      .from('profiles').select('username, email, role, created_at').order('created_at', { ascending: false }).limit(5)
    const { data: recentServers } = await supabase
      .from('servers').select('name, status, created_at').neq('status', 'deleted').order('created_at', { ascending: false }).limit(3)
    const { data: recentTickets } = await supabase
      .from('tickets').select('ticket_id, subject, priority, created_at').order('created_at', { ascending: false }).limit(3)

    const activity = [
      ...(recentUsers || []).map(u => ({ type: 'user', msg: `New user: ${u.username}`, time: u.created_at, color: 'text-mc-grass' })),
      ...(recentServers || []).map(s => ({ type: 'server', msg: `Server deployed: ${s.name}`, time: s.created_at, color: 'text-mc-diamond' })),
      ...(recentTickets || []).map(t => ({ type: 'ticket', msg: `Ticket ${t.ticket_id}: ${t.subject}`, time: t.created_at, color: t.priority === 'high' ? 'text-mc-redstone' : 'text-mc-gold' })),
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8)

    setRecentActivity(activity)

    // Weekly signups (last 7 days)
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const counts: Record<string, number> = {}
    const { data: signups } = await supabase
      .from('profiles')
      .select('created_at')
      .gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString())

    ;(signups || []).forEach(s => {
      const day = days[new Date(s.created_at).getDay()]
      counts[day] = (counts[day] || 0) + 1
    })
    setWeeklySignups(days.map(d => ({ day: d, users: counts[d] || 0 })))
    setLoading(false)
  }

  if (authLoading || !isAdmin) return null

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      <DashboardHeader title="Admin Dashboard" />
      <div className="p-6 flex flex-col gap-6">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Users, label: 'Total Users', value: stats.totalUsers.toLocaleString(), sub: `+${stats.newUsersThisMonth} this month`, color: 'text-mc-grass', border: 'border-mc-grass/20' },
            { icon: Server, label: 'Active Servers', value: stats.activeServers.toLocaleString(), sub: 'Not deleted', color: 'text-mc-diamond', border: 'border-mc-diamond/20' },
            { icon: CreditCard, label: 'MRR', value: `₹${stats.mrr.toLocaleString()}`, sub: 'This month', color: 'text-mc-gold', border: 'border-mc-gold/20' },
            { icon: Ticket, label: 'Open Tickets', value: String(stats.openTickets), sub: 'Need attention', color: 'text-mc-redstone', border: 'border-mc-redstone/20' },
          ].map(({ icon: Icon, label, value, sub, color, border }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className={`mc-card p-5 border ${border}`}>
              <div className="flex items-start justify-between mb-3">
                <p className="text-gray-500 text-xs font-mono uppercase tracking-wider">{label}</p>
                <Icon size={16} className={color} />
              </div>
              <p className={`text-xl font-body font-bold ${color}`}>{loading ? '...' : value}</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp size={10} className="text-mc-emerald" />
                <p className="text-gray-600 text-xs font-mono">{sub}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Weekly signups chart */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mc-card p-5">
          <h3 className="text-gray-400 text-xs font-mono uppercase tracking-wider mb-4">New Signups (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={weeklySignups}>
              <XAxis dataKey="day" tick={{ fill: '#555', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#141420', border: '1px solid #2A2A3E', borderRadius: 0, fontSize: 11 }} />
              <Bar dataKey="users" fill="#5D9E2F" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Activity Feed */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mc-card border border-mc-card-border">
          <div className="px-6 py-4 border-b border-mc-card-border flex items-center gap-2">
            <Activity size={14} className="text-mc-diamond" />
            <h3 className="text-white font-body font-semibold text-sm uppercase tracking-wider">Recent Activity</h3>
          </div>
          <div className="divide-y divide-mc-card-border">
            {recentActivity.length === 0 ? (
              <div className="px-6 py-8 text-gray-600 text-sm font-mono text-center">No activity yet.</div>
            ) : recentActivity.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.04 }}
                className="flex items-center justify-between px-6 py-3 hover:bg-mc-hover-bg transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-1.5 h-1.5 flex-shrink-0 ${item.color.replace('text-', 'bg-')}`} />
                  <p className={`text-sm font-body ${item.color}`}>{item.msg}</p>
                </div>
                <span className="text-gray-600 text-xs font-mono flex-shrink-0">
                  {new Date(item.time).toLocaleString()}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
