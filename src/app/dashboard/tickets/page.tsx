'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DashboardHeader from '@/components/layout/DashboardHeader'
import { MessageSquare, Plus, Send, Clock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { createClient, type Ticket, type TicketMessage } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'

const PRIORITY_COLORS: Record<string, string> = {
  high: 'text-mc-redstone border-red-800',
  medium: 'text-mc-gold border-yellow-800',
  low: 'text-mc-emerald border-green-800',
  urgent: 'text-mc-redstone border-red-800',
}
const STATUS_COLORS: Record<string, string> = {
  open: 'text-mc-gold', 'in-progress': 'text-mc-diamond', waiting: 'text-mc-gold', closed: 'text-gray-500',
}

export default function TicketsPage() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null)
  const [messages, setMessages] = useState<TicketMessage[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [newTicket, setNewTicket] = useState({ subject: '', priority: 'medium', category: 'general', message: '' })
  const [creating, setCreating] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const loadTickets = useCallback(async () => {
    if (!user) return
    const { data } = await supabase.from('tickets').select('*').eq('user_id', user.id).order('updated_at', { ascending: false })
    setTickets(data || [])
    setLoading(false)
  }, [user])

  const loadMessages = useCallback(async (ticketId: string) => {
    const { data } = await supabase
      .from('ticket_messages')
      .select('*, profiles(username, role)')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true })
    setMessages(data || [])
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }, [])

  useEffect(() => { loadTickets() }, [loadTickets])

  // Realtime subscription for messages
  useEffect(() => {
    if (!activeTicket) return
    loadMessages(activeTicket.id)

    const channel = supabase.channel(`ticket-${activeTicket.id}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'ticket_messages',
        filter: `ticket_id=eq.${activeTicket.id}`,
      }, payload => {
        setMessages(prev => [...prev, payload.new as TicketMessage])
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [activeTicket?.id])

  const openTicket = (t: Ticket) => {
    setActiveTicket(t)
    setShowCreate(false)
  }

  const sendReply = async () => {
    if (!reply.trim() || !activeTicket || sending) return
    setSending(true)
    try {
      const res = await fetch(`/api/tickets/${activeTicket.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: reply.trim() }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
      setReply('')
      loadTickets()
    } catch (err: any) {
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  const createTicket = async () => {
    if (!newTicket.subject || !newTicket.message) return
    setCreating(true)
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTicket),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      await loadTickets()
      setShowCreate(false)
      setNewTicket({ subject: '', priority: 'medium', category: 'general', message: '' })
      setActiveTicket(data.ticket)
    } catch (err: any) {
      console.error(err)
    } finally {
      setCreating(false)
    }
  }

  if (loading) return (
    <div className="flex flex-col flex-1"><DashboardHeader title="Support Tickets" />
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500 font-mono text-sm animate-pulse">Loading tickets...</p>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      <DashboardHeader title="Support Tickets" />
      <div className="p-6">
        <AnimatePresence mode="wait">

          {/* List view */}
          {!activeTicket && !showCreate && (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between mb-6">
                <p className="text-gray-500 text-sm font-body">{tickets.filter(t => t.status !== 'closed').length} open ticket(s)</p>
                <button onClick={() => setShowCreate(true)} className="mc-btn flex items-center gap-2 text-xs px-4 py-2">
                  <Plus size={14} /> New Ticket
                </button>
              </div>

              {tickets.length === 0 ? (
                <div className="mc-card p-12 text-center border border-dashed border-mc-card-border">
                  <MessageSquare size={32} className="text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 font-body text-sm">No tickets yet. Need help?</p>
                  <button onClick={() => setShowCreate(true)} className="mc-btn mt-4 px-6 py-2 text-xs">Open a Ticket</button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {tickets.map((ticket, i) => (
                    <motion.div key={ticket.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                      onClick={() => openTicket(ticket)}
                      className="mc-card p-5 border border-mc-card-border hover:border-mc-diamond/30 cursor-pointer transition-all">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <MessageSquare size={18} className={STATUS_COLORS[ticket.status]} />
                          <div>
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-white font-body font-semibold text-sm">{ticket.subject}</span>
                              <span className={`mc-badge text-xs ${PRIORITY_COLORS[ticket.priority]}`}>{ticket.priority}</span>
                            </div>
                            <div className="text-xs font-mono text-gray-500 flex gap-4">
                              <span>{ticket.ticket_id}</span>
                              <span><Clock size={10} className="inline mr-1" />{new Date(ticket.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className={`text-xs font-mono uppercase flex items-center gap-1 ${STATUS_COLORS[ticket.status]}`}>
                          {ticket.status === 'closed' ? <CheckCircle size={13} /> : <AlertCircle size={13} />}
                          {ticket.status}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Create form */}
          {showCreate && (
            <motion.div key="create" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl">
              <button onClick={() => setShowCreate(false)} className="text-mc-diamond text-xs font-mono mb-4 hover:underline">← Back to tickets</button>
              <h3 className="text-white font-body font-bold text-base mb-4">Open Support Ticket</h3>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-mono text-gray-400 uppercase mb-2">Subject</label>
                  <input type="text" value={newTicket.subject} onChange={e => setNewTicket(p => ({ ...p, subject: e.target.value }))}
                    placeholder="Briefly describe your issue" className="mc-input" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-gray-400 uppercase mb-2">Priority</label>
                    <select value={newTicket.priority} onChange={e => setNewTicket(p => ({ ...p, priority: e.target.value }))} className="mc-input">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-gray-400 uppercase mb-2">Category</label>
                    <select value={newTicket.category} onChange={e => setNewTicket(p => ({ ...p, category: e.target.value }))} className="mc-input">
                      <option value="general">General</option>
                      <option value="technical">Technical</option>
                      <option value="billing">Billing</option>
                      <option value="abuse">Abuse</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-400 uppercase mb-2">Message</label>
                  <textarea rows={5} value={newTicket.message} onChange={e => setNewTicket(p => ({ ...p, message: e.target.value }))}
                    placeholder="Describe your issue in detail..." className="mc-input resize-none" />
                </div>
                <div className="flex gap-3">
                  <button onClick={createTicket} disabled={!newTicket.subject || !newTicket.message || creating}
                    className="mc-btn px-6 py-2 text-sm disabled:opacity-50 flex items-center gap-2">
                    {creating ? <><RefreshCw size={12} className="animate-spin" /> Creating...</> : 'Submit Ticket'}
                  </button>
                  <button onClick={() => setShowCreate(false)} className="border border-mc-card-border text-gray-400 px-4 py-2 text-sm hover:text-white transition-colors">Cancel</button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Chat view */}
          {activeTicket && !showCreate && (
            <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <button onClick={() => setActiveTicket(null)} className="text-mc-diamond text-xs font-mono mb-4 hover:underline">← Back to tickets</button>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-white font-body font-bold">{activeTicket.subject}</h3>
                  <div className="flex gap-3 text-xs font-mono text-gray-500 mt-1">
                    <span>{activeTicket.ticket_id}</span>
                    <span className={`mc-badge ${PRIORITY_COLORS[activeTicket.priority]}`}>{activeTicket.priority}</span>
                    <span className={STATUS_COLORS[activeTicket.status]}>{activeTicket.status}</span>
                  </div>
                </div>
              </div>

              <div className="mc-card border border-mc-card-border mb-4">
                <div className="p-4 divide-y divide-mc-card-border max-h-96 overflow-y-auto">
                  {messages.length === 0 ? (
                    <p className="py-4 text-gray-600 text-sm font-mono text-center">No messages yet.</p>
                  ) : messages.map((msg, i) => {
                    const isUser = msg.sender_role === 'user'
                    const sender = (msg as any).profiles?.username || (isUser ? 'You' : 'Support')
                    return (
                      <div key={msg.id} className={`py-4 flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center text-xs font-mono border pixel-art ${isUser ? 'bg-mc-grass/10 border-mc-grass/30 text-mc-grass' : 'bg-mc-diamond/10 border-mc-diamond/30 text-mc-diamond'}`}>
                          {isUser ? 'U' : '🛡'}
                        </div>
                        <div className={`flex-1 ${isUser ? 'text-right' : ''}`}>
                          <div className={`flex items-center gap-2 mb-1 ${isUser ? 'justify-end' : ''}`}>
                            <span className="text-white text-xs font-body font-semibold">{sender}</span>
                            <span className="text-gray-600 text-xs font-mono">{new Date(msg.created_at).toLocaleTimeString()}</span>
                          </div>
                          <div className={`inline-block text-sm font-body text-gray-300 px-4 py-3 border max-w-md text-left ${isUser ? 'border-mc-grass/20 bg-mc-grass/5' : 'border-mc-diamond/20 bg-mc-diamond/5'}`}>
                            {msg.content}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={bottomRef} />
                </div>

                {activeTicket.status !== 'closed' && (
                  <div className="flex border-t border-mc-card-border">
                    <textarea rows={2} value={reply} onChange={e => setReply(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply() } }}
                      placeholder="Type your reply... (Enter to send, Shift+Enter for new line)"
                      className="flex-1 bg-transparent px-4 py-3 text-sm font-body text-white focus:outline-none placeholder-gray-600 resize-none" />
                    <button onClick={sendReply} disabled={!reply.trim() || sending}
                      className="px-4 text-mc-diamond hover:bg-mc-hover-bg transition-colors border-l border-mc-card-border disabled:opacity-40">
                      {sending ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
                    </button>
                  </div>
                )}
                {activeTicket.status === 'closed' && (
                  <div className="px-4 py-3 border-t border-mc-card-border text-center text-gray-600 text-xs font-mono">
                    This ticket is closed. <button onClick={() => setShowCreate(true)} className="text-mc-diamond hover:underline">Open a new ticket</button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
