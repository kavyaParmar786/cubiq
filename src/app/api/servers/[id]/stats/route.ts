import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase-server'
import { pteroGetResources } from '@/lib/pterodactyl'

export async function GET(
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
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (!server) return NextResponse.json({ error: 'Server not found' }, { status: 404 })

    // Real stats from Pterodactyl
    if (server.pterodactyl_uuid) {
      const resources = await pteroGetResources(server.pterodactyl_uuid)
      const mb = (bytes: number) => Math.round(bytes / (1024 * 1024))

      return NextResponse.json({
        state: resources.current_state,
        cpu: Math.round(resources.resources.cpu_absolute * 10) / 10,
        ram: mb(resources.resources.memory_bytes),
        ramMax: server.ram,
        disk: mb(resources.resources.disk_bytes),
        diskMax: server.disk,
        uptime: resources.resources.uptime,
        network: {
          rx: mb(resources.resources.network_rx_bytes),
          tx: mb(resources.resources.network_tx_bytes),
        },
      })
    }

    // Dev mock stats
    return NextResponse.json({
      state: server.status,
      cpu: parseFloat((Math.random() * 40 + 10).toFixed(1)),
      ram: Math.floor(Math.random() * (server.ram * 0.6) + server.ram * 0.2),
      ramMax: server.ram,
      disk: Math.floor(server.disk * 0.3),
      diskMax: server.disk,
      uptime: Date.now() - Math.floor(Math.random() * 86400000),
      network: { rx: Math.floor(Math.random() * 100), tx: Math.floor(Math.random() * 50) },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
