import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase'
import { pteroCreateServer } from '@/lib/pterodactyl'
import { sendServerDeployedEmail } from '@/lib/email'

// GET /api/servers — List user's servers
export async function GET() {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: servers, error } = await supabase
      .from('servers')
      .select('*, plans(*), nodes(name, location_city, location_flag)')
      .eq('user_id', user.id)
      .neq('status', 'deleted')
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ servers })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST /api/servers — Create a new server
export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const admin = createAdminClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { name, type, version, planId } = await req.json()

    if (!name || !planId) {
      return NextResponse.json({ error: 'name and planId required' }, { status: 400 })
    }

    // Get plan
    const { data: plan } = await admin.from('plans').select('*').eq('id', planId).single()
    if (!plan || !plan.is_active) {
      return NextResponse.json({ error: 'Plan not found or unavailable' }, { status: 404 })
    }

    // Get user profile (need pterodactyl_id)
    const { data: profile } = await admin.from('profiles').select('*').eq('id', user.id).single()
    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    // Auto-assign default node (admin-controlled)
    const { data: node } = await admin
      .from('nodes')
      .select('*')
      .eq('status', 'online')
      .eq('is_default', true)
      .maybeSingle()

    const { data: fallbackNode } = !node
      ? await admin.from('nodes').select('*').eq('status', 'online').limit(1).maybeSingle()
      : { data: null }

    const assignedNode = node || fallbackNode
    if (!assignedNode) {
      return NextResponse.json({ error: 'No nodes available. Contact support.' }, { status: 503 })
    }

    // Create server record first (status: installing)
    const nextBilling = new Date()
    nextBilling.setMonth(nextBilling.getMonth() + 1)

    const { data: server, error: serverError } = await admin
      .from('servers')
      .insert({
        user_id: user.id,
        plan_id: planId,
        node_id: assignedNode.id,
        name: name.trim(),
        type: type || 'paper',
        version: version || '1.20.4',
        status: 'installing',
        ram: plan.ram,
        cpu: plan.cpu,
        disk: plan.disk,
        next_billing_date: nextBilling.toISOString(),
      })
      .select()
      .single()

    if (serverError) throw serverError

    // Deploy to Pterodactyl asynchronously (don't block the response)
    if (profile.pterodactyl_id && assignedNode.pterodactyl_node_id) {
      deployToPterodactyl({
        server,
        profile,
        plan,
        node: assignedNode,
        admin,
        email: user.email!,
      }).catch(console.error)
    } else {
      // Dev mode: simulate deploy
      setTimeout(async () => {
        await admin.from('servers').update({
          status: 'offline',
          connection_ip: '127.0.0.1',
          connection_port: 25565,
        }).eq('id', server.id)
      }, 3000)
    }

    return NextResponse.json({ server, message: 'Server is being deployed.' }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

async function deployToPterodactyl({ server, profile, plan, node, admin, email }: any) {
  try {
    const pteroServer = await pteroCreateServer({
      name: server.name,
      pterodactylUserId: profile.pterodactyl_id,
      nodeId: node.pterodactyl_node_id,
      ram: plan.ram,
      cpu: plan.cpu,
      disk: plan.disk,
      databases: plan.databases,
      backups: plan.backups,
    })

    // Update server record with Pterodactyl IDs
    await admin.from('servers').update({
      pterodactyl_server_id: String(pteroServer.id),
      pterodactyl_uuid: pteroServer.identifier,
      status: 'offline',
      connection_ip: node.ip,
      connection_port: 25565,
    }).eq('id', server.id)

    // Send email
    await sendServerDeployedEmail(email, server.name, node.ip, 25565).catch(console.warn)
  } catch (err) {
    console.error('Pterodactyl deploy failed:', err)
    await admin.from('servers').update({ status: 'offline' }).eq('id', server.id)
  }
}
