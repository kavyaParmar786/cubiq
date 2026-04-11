import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase'
import { pteroDeleteServer } from '@/lib/pterodactyl'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient()
    const admin = createAdminClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: server } = await admin
      .from('servers')
      .select('pterodactyl_server_id, user_id')
      .eq('id', params.id)
      .single()

    if (!server) return NextResponse.json({ error: 'Server not found' }, { status: 404 })

    // Only owner or admin can delete
    const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single()
    if (server.user_id !== user.id && profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete from Pterodactyl
    if (server.pterodactyl_server_id) {
      await pteroDeleteServer(parseInt(server.pterodactyl_server_id)).catch(console.warn)
    }

    await admin.from('servers').update({ status: 'deleted' }).eq('id', params.id)
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
