import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase'
import { pteroInstallModpack } from '@/lib/pterodactyl'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient()
    const admin = createAdminClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { modpackId } = await req.json()
    if (!modpackId) return NextResponse.json({ error: 'modpackId required' }, { status: 400 })

    const { data: server } = await admin
      .from('servers')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (!server) return NextResponse.json({ error: 'Server not found' }, { status: 404 })

    // Install on Pterodactyl
    if (server.pterodactyl_server_id) {
      await pteroInstallModpack(parseInt(server.pterodactyl_server_id), modpackId)
    }

    // Record modpack in DB
    await admin.from('servers').update({ modpack: modpackId, status: 'installing' }).eq('id', params.id)

    return NextResponse.json({ ok: true, message: `Installing ${modpackId}...` })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
