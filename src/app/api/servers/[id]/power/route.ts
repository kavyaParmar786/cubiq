import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase-server'
import { pteroPowerAction } from '@/lib/pterodactyl'

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
    if (!['start', 'stop', 'restart', 'kill'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Verify ownership
    const { data: server } = await admin
      .from('servers')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (!server) return NextResponse.json({ error: 'Server not found' }, { status: 404 })
    if (server.status === 'suspended') {
      return NextResponse.json({ error: 'Server is suspended. Contact support.' }, { status: 403 })
    }

    // Send to Pterodactyl if we have the identifier
    if (server.pterodactyl_uuid) {
      await pteroPowerAction(server.pterodactyl_uuid, action)
    }

    // Update status optimistically
    const statusMap: Record<string, string> = {
      start: 'starting',
      stop: 'stopping',
      restart: 'starting',
      kill: 'offline',
    }

    await admin
      .from('servers')
      .update({ status: statusMap[action] })
      .eq('id', params.id)

    return NextResponse.json({ ok: true, status: statusMap[action] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
