import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase-server'
import { sendTicketReplyEmail } from '@/lib/email'

// GET /api/tickets/[id]/messages
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Verify access
    const { data: ticket } = await supabase
      .from('tickets')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })

    const { data: messages, error } = await supabase
      .from('ticket_messages')
      .select('*, profiles(username, role)')
      .eq('ticket_id', params.id)
      .order('created_at', { ascending: true })

    if (error) throw error
    return NextResponse.json({ messages })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST /api/tickets/[id]/messages — Reply
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient()
    const admin = createAdminClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { content } = await req.json()
    if (!content?.trim()) return NextResponse.json({ error: 'Message content required' }, { status: 400 })

    // Verify ticket belongs to user
    const { data: ticket } = await admin
      .from('tickets')
      .select('*, profiles(email)')
      .eq('id', params.id)
      .single()

    if (!ticket || (ticket.user_id !== user.id)) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }
    if (ticket.status === 'closed') {
      return NextResponse.json({ error: 'Ticket is closed' }, { status: 400 })
    }

    // Add message
    const { data: message, error: msgErr } = await admin.from('ticket_messages').insert({
      ticket_id: params.id,
      sender_id: user.id,
      sender_role: 'user',
      content: content.trim(),
    }).select().single()

    if (msgErr) throw msgErr

    // Update ticket status
    await admin.from('tickets').update({ status: 'waiting', updated_at: new Date().toISOString() }).eq('id', params.id)

    return NextResponse.json({ message }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
