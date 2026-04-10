'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DashboardHeader from '@/components/layout/DashboardHeader'
import { MessageSquare, Plus, Send, Clock, CheckCircle, AlertCircle } from 'lucide-react'

const tickets = [
  {
    id: 'TKT-001',
    subject: 'Server not starting after update',
    status: 'open',
    priority: 'high',
    created: '2024-06-12 14:32',
    lastReply: '2024-06-12 16:00',
    messages: [
      { from: 'user', name: 'Steve', msg: 'My server stopped working after I updated Paper. I get an error in console: java.lang.NullPointerException...', time: '14:32' },
      { from: 'support', name: 'Cubiq Support', msg: 'Hi Steve! This is a known issue with the latest Paper build. Please try downgrading to Paper #400. I\'ll send you the steps.', time: '16:00' },
    ],
  },
  {
    id: 'TKT-002',
    subject: 'Upgrade plan question',
    status: 'closed',
    priority: 'low',
    created: '2024-06-10 09:15',
    lastReply: '2024-06-10 11:30',
    messages: [
      { from: 'user', name: 'Steve', msg: 'Can I upgrade mid-cycle? Will I be charged the full month?', time: '09:15' },
      { from: 'support', name: 'Cubiq Support', msg: 'Yes, upgrades are instant and prorated! You\'ll only pay for the remaining days at the new plan rate. Your data is preserved.', time: '11:30' },
    ],
  },
]

const priorityColors: Record<string, string> = {
  high: 'text-mc-redstone border-red-800',
  medium: 'text-mc-gold border-yellow-800',
  low: 'text-mc-emerald border-green-800',
}

const statusColors: Record<string, string> = {
  open: 'text-mc-gold',
  closed: 'text-gray-500',
  'in-progress': 'text-mc-diamond',
}

export default function TicketsPage() {
  const [ticketList, setTicketList] = useState(tickets)
  const [activeTicket, setActiveTicket] = useState<typeof tickets[0] | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [reply, setReply] = useState('')
  const [newTicket, setNewTicket] = useState({ subject: '', priority: 'medium', message: '' })

  const sendReply = () => {
    if (!reply.trim() || !activeTicket) return
    const updated = ticketList.map(t => t.id === activeTicket.id
      ? { ...t, messages: [...t.messages, { from: 'user', name: 'Steve', msg: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }] }
      : t
    )
    setTicketList(updated)
    setActiveTicket(updated.find(t => t.id === activeTicket.id) || null)
    setReply('')
  }

  const createTicket = () => {
    const ticket = {
      id: `TKT-${String(ticketList.length + 1).padStart(3, '0')}`,
      subject: newTicket.subject,
      status: 'open',
      priority: newTicket.priority,
      created: new Date().toLocaleString(),
      lastReply: '—',
      messages: [{ from: 'user', name: 'Steve', msg: newTicket.message, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }],
    }
    setTicketList(prev => [ticket, ...prev])
    setActiveTicket(ticket)
    setShowCreate(false)
    setNewTicket({ subject: '', priority: 'medium', message: '' })
  }

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      <DashboardHeader title="Support Tickets" />
      <div className="p-6">
        {!activeTicket && !showCreate && (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-500 text-sm font-body">{ticketList.filter(t => t.status === 'open').length} open ticket(s)</p>
              <button onClick={() => setShowCreate(true)} className="mc-btn flex items-center gap-2 text-xs px-4 py-2">
                <Plus size={14} /> New Ticket
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {ticketList.map((ticket, i) => (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  onClick={() => setActiveTicket(ticket)}
                  className="mc-card p-5 border border-mc-card-border hover:border-mc-diamond/30 cursor-pointer transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <MessageSquare size={18} className={statusColors[ticket.status]} />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-body font-semibold text-sm">{ticket.subject}</span>
                          <span className={`mc-badge text-xs ${priorityColors[ticket.priority]}`}>{ticket.priority}</span>
                        </div>
                        <div className="text-xs font-mono text-gray-500 flex gap-4">
                          <span>{ticket.id}</span>
                          <span><Clock size={10} className="inline mr-1" />{ticket.created}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-mono uppercase ${statusColors[ticket.status]}`}>
                        {ticket.status === 'open' ? <AlertCircle size={14} className="inline mr-1" /> : <CheckCircle size={14} className="inline mr-1" />}
                        {ticket.status}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* Create ticket form */}
        {showCreate && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl">
            <button onClick={() => setShowCreate(false)} className="text-mc-diamond text-xs font-mono mb-4 hover:underline">← Back to tickets</button>
            <h3 className="text-white font-body font-bold text-base mb-4">Create Support Ticket</h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-mono text-gray-400 uppercase mb-2">Subject</label>
                <input type="text" value={newTicket.subject} onChange={e => setNewTicket(p => ({ ...p, subject: e.target.value }))} placeholder="Briefly describe your issue" className="mc-input" />
              </div>
              <div>
                <label className="block text-xs font-mono text-gray-400 uppercase mb-2">Priority</label>
                <select value={newTicket.priority} onChange={e => setNewTicket(p => ({ ...p, priority: e.target.value }))} className="mc-input">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono text-gray-400 uppercase mb-2">Message</label>
                <textarea rows={5} value={newTicket.message} onChange={e => setNewTicket(p => ({ ...p, message: e.target.value }))} placeholder="Describe your issue in detail..." className="mc-input resize-none" />
              </div>
              <div className="flex gap-3">
                <button onClick={createTicket} disabled={!newTicket.subject || !newTicket.message} className="mc-btn px-6 py-2 text-sm disabled:opacity-50">Submit Ticket</button>
                <button onClick={() => setShowCreate(false)} className="border border-mc-card-border text-gray-400 px-4 py-2 text-sm hover:text-white transition-colors">Cancel</button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Active ticket chat */}
        {activeTicket && !showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <button onClick={() => setActiveTicket(null)} className="text-mc-diamond text-xs font-mono mb-4 hover:underline">← Back to tickets</button>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-body font-bold">{activeTicket.subject}</h3>
                <div className="flex gap-3 text-xs font-mono text-gray-500 mt-1">
                  <span>{activeTicket.id}</span>
                  <span className={`mc-badge ${priorityColors[activeTicket.priority]}`}>{activeTicket.priority}</span>
                  <span className={statusColors[activeTicket.status]}>{activeTicket.status}</span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="mc-card border border-mc-card-border mb-4">
              <div className="p-4 divide-y divide-mc-card-border max-h-96 overflow-y-auto">
                {activeTicket.messages.map((msg, i) => (
                  <div key={i} className={`py-4 flex gap-3 ${msg.from === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center text-xs font-mono border pixel-art ${
                      msg.from === 'support' ? 'bg-mc-diamond/10 border-mc-diamond/30 text-mc-diamond' : 'bg-mc-grass/10 border-mc-grass/30 text-mc-grass'
                    }`}>
                      {msg.from === 'support' ? '🛡' : 'S'}
                    </div>
                    <div className={`flex-1 ${msg.from === 'user' ? 'text-right' : ''}`}>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-white text-xs font-body font-semibold">{msg.name}</span>
                        <span className="text-gray-600 text-xs font-mono">{msg.time}</span>
                      </div>
                      <div className={`inline-block text-sm font-body text-gray-300 px-4 py-3 border max-w-md ${
                        msg.from === 'support' ? 'border-mc-diamond/20 bg-mc-diamond/5' : 'border-mc-grass/20 bg-mc-grass/5'
                      }`}>
                        {msg.msg}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Reply input */}
              {activeTicket.status === 'open' && (
                <div className="flex border-t border-mc-card-border">
                  <textarea
                    rows={2}
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendReply())}
                    placeholder="Type your reply..."
                    className="flex-1 bg-transparent px-4 py-3 text-sm font-body text-white focus:outline-none placeholder-gray-600 resize-none"
                  />
                  <button onClick={sendReply} disabled={!reply.trim()} className="px-4 text-mc-diamond hover:bg-mc-hover-bg transition-colors border-l border-mc-card-border disabled:opacity-40">
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
