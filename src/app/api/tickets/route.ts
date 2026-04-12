import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase-server'
import { sendTicketReplyEmail } from '@/lib/email'

// GET /api/tickets
export async function GET() {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: tickets, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ tickets })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST /api/tickets
export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const admin = createAdminClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { subject, message, priority = 'medium', category = 'general' } = await req.json()
    if (!subject || !message) {
      return NextResponse.json({ error: 'subject and message required' }, { status: 400 })
    }

    // Create ticket (trigger sets ticket_id)
    const { data: ticket, error: ticketErr } = await admin
      .from('tickets')
      .insert({ user_id: user.id, subject, priority, category })
      .select()
      .single()

    if (ticketErr) throw ticketErr

    // Add first message
    await admin.from('ticket_messages').insert({
      ticket_id: ticket.id,
      sender_id: user.id,
      sender_role: 'user',
      content: message,
    })

    return NextResponse.json({ ticket }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
