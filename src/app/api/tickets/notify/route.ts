import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase-server'
import { sendTicketReplyEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const admin = createAdminClient()

    // Verify caller is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { email, ticketId, subject } = await req.json()
    if (!email || !ticketId) return NextResponse.json({ error: 'email and ticketId required' }, { status: 400 })

    await sendTicketReplyEmail(email, ticketId, subject)
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
