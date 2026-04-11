import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient()
    const admin = createAdminClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { action } = await req.json()
    if (!['start', 'stop', 'restart'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const { data: bot } = await admin
      .from('bots').select('*').eq('id', params.id).eq('user_id', user.id).single()

    if (!bot) return NextResponse.json({ error: 'Bot not found' }, { status: 404 })

    const newStatus = action === 'stop' ? 'offline' : 'online'

    await admin.from('bots').update({ status: newStatus }).eq('id', params.id)

    // If bot has a pterodactyl_server_id, send power action
    if (bot.pterodactyl_server_id) {
      const { pteroPowerAction } = await import('@/lib/pterodactyl')
      const signal = action === 'stop' ? 'stop' : action === 'restart' ? 'restart' : 'start'
      await pteroPowerAction(bot.pterodactyl_server_id, signal).catch(console.warn)
    }

    return NextResponse.json({ ok: true, status: newStatus })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
