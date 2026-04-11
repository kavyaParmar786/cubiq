'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DashboardHeader from '@/components/layout/DashboardHeader'
import { MessageSquare, Send, RefreshCw, CheckCircle } from 'lucide-react'
import { createClient, type Ticket, type TicketMessage } from '@/lib/supabase'
import { useAdminGuard } from '@/lib/useAdmin'

const PRIORITY_COLORS: Record<string, string> = {
  high: 'text-mc-redstone border-red-800', urgent: 'text-mc-redstone border-red-800',
  medium: 'text-mc-gold border-yellow-800', low: 'text-mc-emerald border-green-800',
}

export default function AdminTicketsPage() {
  const { isAdmin, loading: authLoading } = useAdminGuard()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null)
  const [messages, setMessages] = useState<TicketMessage[]>([])
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('open')
  const supabase = createClient()

  const loadTickets = useCallback(async () => {
    setLoading(true)
    let q = supabase.from('tickets').select('*, profiles(username, email)').order('updated_at', { ascending: false })
    if (statusFilter !== 'all') q = q.eq('status', statusFilter)
    const { data } = await q
    setTickets(data || [])
    setLoading(false)
  }, [statusFilter])

  useEffect(() => { if (isAdmin) loadTickets() }, [isAdmin, loadTickets])

  const loadMessages = async (ticketId: string) => {
    const { data } = await supabase
      .from('ticket_messages').select('*, profiles(username, role)')
      .eq('ticket_id', ticketId).order('created_at', { ascending: true })
    setMessages(data || [])
  }

  const openTicket = async (t: Ticket) => {
    setActiveTicket(t)
    await loadMessages(t.id)
  }

  const sendAdminReply = async () => {
    if (!reply.trim() || !activeTicket || sending) return
    setSending(true)
    try {
      // Insert message directly as admin
      await supabase.from('ticket_messages').insert({
        ticket_id: activeTicket.id,
        sender_id: (await supabase.auth.getUser()).data.user?.id,
        sender_role: 'admin',
        content: reply.trim(),
      })
      await supabase.from('tickets').update({ status: 'in-progress', updated_at: new Date().toISOString() }).eq('id', activeTicket.id)

      // Reload messages
      await loadMessages(activeTicket.id)

      // Send email notification via API
      const owner = (activeTicket as any).profiles
      if (owner?.email) {
        await fetch('/api/tickets/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: owner.email, ticketId: activeTicket.ticket_id, subject: activeTicket.subject }),
        }).catch(console.warn)
      }

      setReply('')
      loadTickets()
    } finally {
      setSending(false)
    }
  }

  const closeTicket = async (id: string) => {
    await supabase.from('tickets').update({ status: 'closed', closed_at: new Date().toISOString() }).eq('id', id)
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'closed' } : t))
    if (activeTicket?.id === id) setActiveTicket(prev => prev ? { ...prev, status: 'closed' } : null)
  }

  if (authLoading || !isAdmin) return null

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      <DashboardHeader title="Ticket Management" />
      <div className="p-6 flex gap-6">
        {/* Ticket List */}
        <div className={`flex flex-col gap-3 ${activeTicket ? 'hidden lg:flex lg:w-80 flex-shrink-0' : 'flex-1'}`}>
          <div className="flex gap-2 flex-wrap">
            {['open', 'in-progress', 'waiting', 'closed', 'all'].map(f => (
              <button key={f} onClick={() => setStatusFilter(f)}
                className={`px-3 py-1.5 text-xs font-mono uppercase border transition-all ${statusFilter === f ? 'border-mc-diamond text-mc-diamond bg-mc-diamond/5' : 'border-mc-card-border text-gray-500 hover:text-white'}`}>
                {f}
              </button>
            ))}
            <button onClick={loadTickets} className="px-2 py-1.5 border border-mc-card-border text-gray-500">
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          {loading ? (
            <p className="text-gray-500 font-mono text-sm animate-pulse">Loading...</p>
          ) : tickets.length === 0 ? (
            <div className="mc-card p-8 text-center border border-mc-card-border text-gray-600 text-sm font-mono">No tickets.</div>
          ) : tickets.map((ticket, i) => {
            const owner = (ticket as any).profiles
            return (
              <motion.div key={ticket.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                onClick={() => openTicket(ticket)}
                className={`mc-card p-4 border cursor-pointer transition-all hover:border-mc-diamond/30 ${activeTicket?.id === ticket.id ? 'border-mc-diamond' : 'border-mc-card-border'}`}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-white font-body font-semibold text-sm leading-tight">{ticket.subject}</span>
                  <span className={`mc-badge text-xs flex-shrink-0 ${PRIORITY_COLORS[ticket.priority]}`}>{ticket.priority}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono text-gray-500">
                  <span>{ticket.ticket_id} · {owner?.username || '?'}</span>
                  <span className={ticket.status === 'open' ? 'text-mc-gold' : ticket.status === 'closed' ? 'text-gray-600' : 'text-mc-diamond'}>
                    {ticket.status}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Chat Panel */}
        <AnimatePresence>
          {activeTicket && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              className="flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <button onClick={() => setActiveTicket(null)} className="text-mc-diamond text-xs font-mono hover:underline mb-1 block lg:hidden">← Back</button>
                  <h3 className="text-white font-body font-bold">{activeTicket.subject}</h3>
                  <div className="flex gap-3 text-xs font-mono text-gray-500 mt-1">
                    <span>{activeTicket.ticket_id}</span>
                    <span className={`mc-badge ${PRIORITY_COLORS[activeTicket.priority]}`}>{activeTicket.priority}</span>
                    <span>{(activeTicket as any).profiles?.username}</span>
                    <span>{(activeTicket as any).profiles?.email}</span>
                  </div>
                </div>
                {activeTicket.status !== 'closed' && (
                  <button onClick={() => closeTicket(activeTicket.id)}
                    className="flex items-center gap-1 px-3 py-2 border border-mc-grass/40 text-mc-grass hover:bg-mc-grass/10 text-xs uppercase transition-all">
                    <CheckCircle size={12} /> Close Ticket
                  </button>
                )}
              </div>

              <div className="mc-card border border-mc-card-border flex flex-col flex-1">
                <div className="flex-1 p-4 divide-y divide-mc-card-border overflow-y-auto max-h-[500px]">
                  {messages.length === 0 ? (
                    <p className="py-4 text-gray-600 text-sm font-mono text-center">No messages.</p>
                  ) : messages.map(msg => {
                    const isAdmin = msg.sender_role === 'admin'
                    const sender = (msg as any).profiles?.username || (isAdmin ? 'Admin' : 'User')
                    return (
                      <div key={msg.id} className={`py-4 flex gap-3 ${isAdmin ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center text-xs font-mono border pixel-art ${isAdmin ? 'bg-mc-redstone/10 border-mc-redstone/30 text-mc-redstone' : 'bg-mc-grass/10 border-mc-grass/30 text-mc-grass'}`}>
                          {isAdmin ? '🛡' : 'U'}
                        </div>
                        <div className={`flex-1 ${isAdmin ? 'text-right' : ''}`}>
                          <div className={`flex items-center gap-2 mb-1 ${isAdmin ? 'justify-end' : ''}`}>
                            <span className="text-white text-xs font-body font-semibold">{sender}</span>
                            <span className="text-gray-600 text-xs font-mono">{new Date(msg.created_at).toLocaleTimeString()}</span>
                          </div>
                          <div className={`inline-block text-sm font-body text-gray-300 px-4 py-3 border max-w-md text-left ${isAdmin ? 'border-mc-redstone/20 bg-mc-redstone/5' : 'border-mc-grass/20 bg-mc-grass/5'}`}>
                            {msg.content}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {activeTicket.status !== 'closed' ? (
                  <div className="flex border-t border-mc-card-border">
                    <textarea rows={2} value={reply} onChange={e => setReply(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendAdminReply() } }}
                      placeholder="Admin reply... (Enter to send)"
                      className="flex-1 bg-transparent px-4 py-3 text-sm font-body text-white focus:outline-none placeholder-gray-600 resize-none" />
                    <button onClick={sendAdminReply} disabled={!reply.trim() || sending}
                      className="px-4 text-mc-redstone hover:bg-mc-hover-bg transition-colors border-l border-mc-card-border disabled:opacity-40">
                      {sending ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
                    </button>
                  </div>
                ) : (
                  <div className="px-4 py-3 border-t border-mc-card-border text-center text-gray-600 text-xs font-mono">Ticket closed.</div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
