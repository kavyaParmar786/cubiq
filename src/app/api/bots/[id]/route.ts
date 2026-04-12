import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase-server'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient()
    const admin = createAdminClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: bot } = await admin
      .from('bots').select('pterodactyl_server_id').eq('id', params.id).eq('user_id', user.id).single()

    if (!bot) return NextResponse.json({ error: 'Bot not found' }, { status: 404 })

    // Delete from Pterodactyl if linked
    if (bot.pterodactyl_server_id) {
      const { pteroDeleteServer } = await import('@/lib/pterodactyl')
      await pteroDeleteServer(parseInt(bot.pterodactyl_server_id)).catch(console.warn)
    }

    await admin.from('bots').delete().eq('id', params.id)
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
