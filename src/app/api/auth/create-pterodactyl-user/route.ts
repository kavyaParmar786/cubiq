import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { pteroCreateUser } from '@/lib/pterodactyl'
import { sendWelcomeEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { userId, email, username } = await req.json()

    // Create Pterodactyl user
    let pterodactylId: number | null = null
    try {
      const pteroUser = await pteroCreateUser(email, username, username, `CubiqAuto_${Date.now()}`)
      pterodactylId = pteroUser.id
    } catch (e) {
      console.warn('Pterodactyl user creation failed (non-fatal):', e)
    }

    // Update profile with pterodactyl_id
    const admin = createAdminClient()
    if (pterodactylId) {
      await admin
        .from('profiles')
        .update({ pterodactyl_id: pterodactylId })
        .eq('id', userId)
    }

    // Send welcome email
    await sendWelcomeEmail(email, username).catch(console.warn)

    return NextResponse.json({ ok: true, pterodactylId })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
