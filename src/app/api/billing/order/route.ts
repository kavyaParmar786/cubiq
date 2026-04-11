import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase'
import { sendPaymentSuccessEmail } from '@/lib/email'

// POST /api/billing/order
export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const admin = createAdminClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { planId, serverId } = await req.json()
    if (!planId) return NextResponse.json({ error: 'planId required' }, { status: 400 })

    const { data: plan } = await admin.from('plans').select('*').eq('id', planId).single()
    if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 })

    const amountPaise = plan.price * 100
    const invoiceId = `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`

    let order: any = null

    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      // Real Razorpay order
      const authHeader = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64')
      const res = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: { 'Authorization': `Basic ${authHeader}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountPaise,
          currency: 'INR',
          receipt: invoiceId,
          notes: { userId: user.id, planId },
        }),
      })
      order = await res.json()
      if (order.error) throw new Error(order.error.description)
    } else {
      // Dev mock
      order = { id: `order_mock_${Date.now()}`, amount: amountPaise, currency: 'INR' }
    }

    // Save pending payment record
    const { data: payment } = await admin.from('payments').insert({
      user_id: user.id,
      plan_id: planId,
      server_id: serverId || null,
      razorpay_order_id: order.id,
      amount: amountPaise,
      status: 'pending',
      description: `${plan.display_name} Plan`,
      invoice_id: invoiceId,
    }).select().single()

    return NextResponse.json({
      orderId: order.id,
      amount: amountPaise,
      currency: 'INR',
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      paymentRecordId: payment?.id,
      planName: plan.display_name,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
