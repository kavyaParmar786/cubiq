import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase-server'
import { sendPaymentSuccessEmail } from '@/lib/email'
import { createHmac } from 'crypto'

// POST /api/billing/verify
export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const admin = createAdminClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, paymentRecordId } = await req.json()

    // Verify Razorpay signature
    let isValid = false
    if (process.env.RAZORPAY_KEY_SECRET) {
      const body = `${razorpayOrderId}|${razorpayPaymentId}`
      const expectedSig = createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body).digest('hex')
      isValid = expectedSig === razorpaySignature
    } else {
      isValid = true // Dev bypass
    }

    if (!isValid) {
      return NextResponse.json({ error: 'Payment verification failed. Invalid signature.' }, { status: 400 })
    }

    // Update payment record
    const periodEnd = new Date()
    periodEnd.setMonth(periodEnd.getMonth() + 1)

    const { data: payment } = await admin
      .from('payments')
      .update({
        razorpay_payment_id: razorpayPaymentId,
        status: 'paid',
        period_start: new Date().toISOString(),
        period_end: periodEnd.toISOString(),
      })
      .eq(paymentRecordId ? 'id' : 'razorpay_order_id', paymentRecordId || razorpayOrderId)
      .eq('user_id', user.id)
      .select('*, plans(display_name, price)')
      .single()

    if (!payment) return NextResponse.json({ error: 'Payment record not found.' }, { status: 404 })

    // Send confirmation email
    const profile = await admin.from('profiles').select('email').eq('id', user.id).single()
    if (profile.data?.email) {
      const plan = (payment as any).plans
      await sendPaymentSuccessEmail(
        profile.data.email,
        payment.amount / 100,
        payment.invoice_id || '',
        plan?.display_name || 'Hosting Plan'
      ).catch(console.warn)
    }

    return NextResponse.json({ ok: true, payment })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
