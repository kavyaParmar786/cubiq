import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase-server'

// GET /api/bots
export async function GET() {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: bots, error } = await supabase
      .from('bots').select('*').eq('user_id', user.id).order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ bots })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST /api/bots
export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const admin = createAdminClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { name, runtime, startCommand, planId } = await req.json()
    if (!name) return NextResponse.json({ error: 'Bot name required' }, { status: 400 })

    const { data: bot, error } = await admin.from('bots').insert({
      user_id: user.id,
      name: name.trim(),
      runtime: runtime || 'nodejs',
      start_command: startCommand || 'node index.js',
      plan_id: planId || null,
      status: 'offline',
    }).select().single()

    if (error) throw error
    return NextResponse.json({ bot }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
