import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()
    const admin = createAdminClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const [usersRes, serversRes, ticketsRes, revenueRes, signupsRes] = await Promise.all([
      admin.from('profiles').select('id', { count: 'exact', head: true }),
      admin.from('servers').select('id', { count: 'exact', head: true }).neq('status', 'deleted'),
      admin.from('tickets').select('id', { count: 'exact', head: true }).in('status', ['open', 'waiting']),
      admin.from('payments').select('amount').eq('status', 'paid').gte('created_at', monthStart),
      admin.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', monthStart),
    ])

    const mrr = (revenueRes.data || []).reduce((acc: number, p: any) => acc + p.amount, 0)

    return NextResponse.json({
      totalUsers: usersRes.count || 0,
      activeServers: serversRes.count || 0,
      openTickets: ticketsRes.count || 0,
      mrr,
      newUsersThisMonth: signupsRes.count || 0,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
