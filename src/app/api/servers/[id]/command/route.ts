import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase'
import { pteroSendCommand } from '@/lib/pterodactyl'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient()
    const admin = createAdminClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { command } = await req.json()
    if (!command?.trim()) return NextResponse.json({ error: 'Command required' }, { status: 400 })

    const { data: server } = await admin
      .from('servers')
      .select('pterodactyl_uuid')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (!server) return NextResponse.json({ error: 'Server not found' }, { status: 404 })

    if (server.pterodactyl_uuid) {
      await pteroSendCommand(server.pterodactyl_uuid, command)
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
