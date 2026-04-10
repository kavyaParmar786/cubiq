'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import DashboardHeader from '@/components/layout/DashboardHeader'
import { MessageSquare, Send, Filter, Clock } from 'lucide-react'

const allTickets = [
  { id: 'TKT-001', user: 'Steve_Miner', subject: 'Server not starting after update', priority: 'high', status: 'open', created: '2024-06-12 14:32', messages: [
    { from: 'user', name: 'Steve_Miner', msg: 'My server stopped working after I updated Paper. Console shows: java.lang.NullPointerException at com.example...', time: '14:32' },
    { from: 'support', name: 'Admin', msg: 'Hi! This is a known issue with Paper build #402. Try downgrading to #400. Here are the steps: 1) Go to File Manager 2) Delete paper.jar 3) Download Paper #400...', time: '16:00' },
  ]},
  { id: 'TKT-002', user: 'PixelQueen', subject: 'Cannot connect via SFTP', priority: 'medium', status: 'open', created: '2024-06-12 10:15', messages: [
    { from: 'user', name: 'PixelQueen', msg: 'I\'m trying to connect via SFTP using FileZilla but it keeps saying "Connection timed out". My credentials are correct.', time: '10:15' },
  ]},
  { id: 'TKT-003', user: 'DevBot_Riya', subject: 'Bot keeps crashing on restart', priority: 'high', status: 'in-progress', created: '2024-06-11 08:40', messages: [
    { from: 'user', name: 'DevBot_Riya', msg: 'My Discord bot crashes within 2 minutes of starting. I see "heap out of memory" in logs.', time: '08:40' },
    { from: 'support', name: 'Admin', msg: 'This is a memory issue. Your bot plan has 512MB RAM. I can see your bot is using 480MB at peak. Would you like to upgrade to BOT PRO?', time: '09:15' },
    { from: 'user', name: 'DevBot_Riya', msg: 'Yes please! How do I upgrade?', time: '09:22' },
  ]},
  { id: 'TKT-004', user: 'NetworkDev', subject: 'Custom domain setup help', priority: 'low', status: 'closed', created: '2024-06-10 14:00', messages: [
    { from: 'user', name: 'NetworkDev', msg: 'Can you help me set up a custom domain for my server?', time: '14:00' },
    { from: 'support', name: 'Admin', msg: 'Sure! You need to add an A record pointing to your server IP in your DNS provider, then enable it in your server settings. Marking as resolved!', time: '14:30' },
  ]},
]

const priorityColors: Record<string, string> = {
  high: 'text-mc-redstone border-red-800',
  medium: 'text-mc-gold border-yellow-800',
  low: 'text-mc-emerald border-green-800',
}

const statusColors: Record<string, string> = {
  open: 'text-mc-gold',
  'in-progress': 'text-mc-diamond',
  closed: 'text-gray-500',
}

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState(allTickets)
  const [activeTicket, setActiveTicket] = useState<typeof allTickets[0] | null>(null)
  const [reply, setReply] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')

  const filtered = tickets.filter(t => {
    const matchStatus = statusFilter === 'all' || t.status === statusFilter
    const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter
    return matchStatus && matchPriority
  })

  const sendReply = () => {
    if (!reply.trim() || !activeTicket) return
    const newMsg = { from: 'support', name: 'Admin', msg: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    const updated = tickets.map(t => t.id === activeTicket.id
      ? { ...t, status: 'in-progress', messages: [...t.messages, newMsg] }
      : t
    )
    setTickets(updated)
    setActiveTicket(updated.find(t => t.id === activeTicket.id) || null)
    setReply('')
  }

  const closeTicket = (id: string) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'closed' } : t))
    if (activeTicket?.id === id) setActiveTicket(null)
  }

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      <DashboardHeader title="Ticket Management" />
      <div className="p-6">

        {/* Filters */}
        {!activeTicket && (
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="flex items-center gap-2">
              <Filter size={12} className="text-gray-500" />
              <span className="text-gray-500 text-xs font-mono uppercase">Status:</span>
              {['all', 'open', 'in-progress', 'closed'].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 text-xs font-mono uppercase border transition-all ${statusFilter === s ? 'border-mc-diamond text-mc-diamond bg-mc-diamond/5' : 'border-mc-card-border text-gray-500 hover:text-white'}`}>
                  {s}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-xs font-mono uppercase">Priority:</span>
              {['all', 'high', 'medium', 'low'].map(p => (
                <button key={p} onClick={() => setPriorityFilter(p)}
                  className={`px-3 py-1.5 text-xs font-mono uppercase border transition-all ${priorityFilter === p ? 'border-mc-diamond text-mc-diamond bg-mc-diamond/5' : 'border-mc-card-border text-gray-500 hover:text-white'}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {!activeTicket ? (
          <div className="flex flex-col gap-3">
            {filtered.map((ticket, i) => (
              <motion.div key={ticket.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                onClick={() => setActiveTicket(ticket)}
                className="mc-card p-5 border border-mc-card-border hover:border-mc-diamond/30 cursor-pointer transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <MessageSquare size={16} className={statusColors[ticket.status]} />
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-white font-body font-semibold text-sm">{ticket.subject}</span>
                        <span className={`mc-badge text-xs ${priorityColors[ticket.priority]}`}>{ticket.priority}</span>
                        <span className={`text-xs font-mono uppercase ${statusColors[ticket.status]}`}>{ticket.status}</span>
                      </div>
                      <div className="text-gray-500 text-xs font-mono flex gap-4">
                        <span>{ticket.id}</span>
                        <span>👤 {ticket.user}</span>
                        <span><Clock size={10} className="inline mr-1" />{ticket.created}</span>
                        <span>💬 {ticket.messages.length} msg{ticket.messages.length !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setActiveTicket(null)} className="text-mc-diamond text-xs font-mono hover:underline">← Back to tickets</button>
              <div className="flex gap-2">
                {activeTicket.status !== 'closed' && (
                  <button onClick={() => closeTicket(activeTicket.id)} className="px-4 py-2 border border-mc-emerald/40 text-mc-emerald text-xs font-body uppercase hover:bg-mc-emerald/10 transition-all">
                    Mark Closed
                  </button>
                )}
              </div>
            </div>

            <div className="mc-card border border-mc-card-border mb-4 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-white font-body font-bold">{activeTicket.subject}</h3>
                  <div className="flex gap-3 text-xs font-mono text-gray-500 mt-1">
                    <span>{activeTicket.id}</span>
                    <span>👤 {activeTicket.user}</span>
                    <span className={`mc-badge ${priorityColors[activeTicket.priority]}`}>{activeTicket.priority}</span>
                    <span className={statusColors[activeTicket.status]}>{activeTicket.status}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mc-card border border-mc-card-border">
              <div className="p-4 divide-y divide-mc-card-border max-h-96 overflow-y-auto">
                {activeTicket.messages.map((msg, i) => (
                  <div key={i} className={`py-4 flex gap-3 ${msg.from === 'support' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center text-xs border pixel-art ${
                      msg.from === 'support' ? 'bg-mc-redstone/10 border-mc-redstone/30 text-mc-redstone' : 'bg-mc-grass/10 border-mc-grass/30 text-mc-grass'
                    }`}>
                      {msg.from === 'support' ? '🛡' : msg.name[0].toUpperCase()}
                    </div>
                    <div className={`flex-1 ${msg.from === 'support' ? 'text-right' : ''}`}>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-white text-xs font-body font-semibold">{msg.name}</span>
                        <span className="text-gray-600 text-xs font-mono">{msg.time}</span>
                      </div>
                      <div className={`inline-block text-sm font-body text-gray-300 px-4 py-3 border max-w-md ${
                        msg.from === 'support' ? 'border-mc-redstone/20 bg-mc-redstone/5' : 'border-mc-grass/20 bg-mc-grass/5'
                      }`}>
                        {msg.msg}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {activeTicket.status !== 'closed' && (
                <div className="flex border-t border-mc-card-border">
                  <textarea
                    rows={2}
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendReply())}
                    placeholder="Type admin reply..."
                    className="flex-1 bg-transparent px-4 py-3 text-sm font-body text-white focus:outline-none placeholder-gray-600 resize-none"
                  />
                  <button onClick={sendReply} disabled={!reply.trim()} className="px-4 text-mc-redstone hover:bg-mc-hover-bg transition-colors border-l border-mc-card-border disabled:opacity-40">
                    <Send size={16} />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
