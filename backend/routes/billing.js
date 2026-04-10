const express = require('express')
const router = express.Router()
const Razorpay = require('razorpay')
const crypto = require('crypto')
const { authenticate } = require('../middleware/auth')
const { Payment, Plan } = require('../models/models')
const { sendPaymentSuccessEmail } = require('../utils/email')

// Init Razorpay (mock-safe)
let razorpay
try {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  })
} catch (e) {
  console.warn('Razorpay init skipped (check env vars)')
}

router.use(authenticate)

// ── GET /api/billing/plans ────────────────────────────────────
router.get('/plans', async (req, res) => {
  const plans = await Plan.find({ isActive: true }).sort({ sortOrder: 1 })
  res.json({ plans })
})

// ── GET /api/billing/invoices ─────────────────────────────────
router.get('/invoices', async (req, res) => {
  const payments = await Payment.find({ user: req.user._id })
    .populate('plan', 'displayName name')
    .populate('server', 'name')
    .sort({ createdAt: -1 })
  res.json({ payments })
})

// ── POST /api/billing/order — Create Razorpay order ──────────
router.post('/order', async (req, res) => {
  try {
    const { planId, serverId } = req.body

    const plan = await Plan.findById(planId)
    if (!plan) return res.status(404).json({ error: 'Plan not found.' })

    const amountPaise = plan.price * 100 // Razorpay uses paise

    let order
    if (razorpay) {
      order = await razorpay.orders.create({
        amount: amountPaise,
        currency: 'INR',
        receipt: `rcpt_${Date.now()}`,
        notes: {
          userId: req.user._id.toString(),
          planId: planId,
        },
      })
    } else {
      // Mock order for development
      order = {
        id: `order_mock_${Date.now()}`,
        amount: amountPaise,
        currency: 'INR',
      }
    }

    // Create pending payment record
    const invoiceId = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`
    const payment = await Payment.create({
      user: req.user._id,
      plan: planId,
      server: serverId || null,
      razorpayOrderId: order.id,
      amount: amountPaise,
      status: 'pending',
      description: `${plan.displayName} Plan`,
      invoiceId,
    })

    res.json({
      orderId: order.id,
      amount: amountPaise,
      currency: 'INR',
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      paymentId: payment._id,
    })
  } catch (err) {
    console.error('Create order error:', err)
    res.status(500).json({ error: 'Failed to create payment order.' })
  }
})

// ── POST /api/billing/verify — Verify payment signature ───────
router.post('/verify', async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body

    // Verify signature
    let isValid = false
    if (process.env.RAZORPAY_KEY_SECRET) {
      const body = `${razorpayOrderId}|${razorpayPaymentId}`
      const expectedSig = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest('hex')
      isValid = expectedSig === razorpaySignature
    } else {
      isValid = true // Dev mode bypass
    }

    if (!isValid) {
      return res.status(400).json({ error: 'Payment verification failed. Invalid signature.' })
    }

    // Update payment record
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId, user: req.user._id },
      {
        razorpayPaymentId,
        razorpaySignature,
        status: 'paid',
        periodStart: new Date(),
        periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      { new: true }
    ).populate('plan')

    if (!payment) return res.status(404).json({ error: 'Payment record not found.' })

    // Send confirmation email
    sendPaymentSuccessEmail(req.user, payment, payment.plan).catch(console.warn)

    res.json({ message: 'Payment verified successfully.', payment })
  } catch (err) {
    console.error('Verify payment error:', err)
    res.status(500).json({ error: 'Payment verification failed.' })
  }
})

module.exports = router
