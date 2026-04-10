const express = require('express')
const router = express.Router()
const { authenticate, adminOnly } = require('../middleware/auth')
const User = require('../models/User')
const Server = require('../models/Server')
const { Ticket, Payment, Plan, Node } = require('../models/models')
const { suspendServer, unsuspendServer, deletePteroServer } = require('../utils/pterodactyl')
const { sendTicketReplyEmail } = require('../utils/email')

// All admin routes require auth + admin role
router.use(authenticate, adminOnly)

// ── DASHBOARD STATS ───────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, activeServers, openTickets, monthlyRevenue] = await Promise.all([
      User.countDocuments(),
      Server.countDocuments({ status: { $in: ['online', 'offline', 'starting'] } }),
      Ticket.countDocuments({ status: 'open' }),
      Payment.aggregate([
        {
          $match: {
            status: 'paid',
            createdAt: { $gte: new Date(new Date().setDate(1)) }, // This month
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ])

    res.json({
      totalUsers,
      activeServers,
      openTickets,
      monthlyRevenue: monthlyRevenue[0]?.total / 100 || 0, // Convert paise to INR
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats.' })
  }
})

// ── USER MANAGEMENT ───────────────────────────────────────────
router.get('/users', async (req, res) => {
  const { search, status, page = 1, limit = 50 } = req.query
  const query = {}
  if (search) query.$or = [
    { username: new RegExp(search, 'i') },
    { email: new RegExp(search, 'i') },
  ]
  if (status) query.status = status

  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit))

  const total = await User.countDocuments(query)
  res.json({ users, total, page: Number(page) })
})

router.put('/users/:id/status', async (req, res) => {
  const { status } = req.body
  if (!['active', 'suspended', 'banned'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status.' })
  }
  const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true })
  if (!user) return res.status(404).json({ error: 'User not found.' })
  res.json({ message: `User status updated to ${status}.`, user })
})

router.delete('/users/:id', async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id)
  if (!user) return res.status(404).json({ error: 'User not found.' })
  // Also clean up their servers
  await Server.updateMany({ owner: req.params.id }, { status: 'deleted' })
  res.json({ message: 'User deleted.' })
})

// ── SERVER CONTROL ────────────────────────────────────────────
router.get('/servers', async (req, res) => {
  const servers = await Server.find({ status: { $ne: 'deleted' } })
    .populate('owner', 'username email')
    .populate('plan', 'name displayName')
    .populate('node', 'name location')
    .sort({ createdAt: -1 })

  res.json({ servers })
})

router.post('/servers/:id/suspend', async (req, res) => {
  const { reason } = req.body
  const server = await Server.findById(req.params.id)
  if (!server) return res.status(404).json({ error: 'Server not found.' })

  if (server.pterodactylId) {
    try { await suspendServer(server.pterodactylId) } catch (e) { console.warn(e.message) }
  }

  server.status = 'suspended'
  server.suspendReason = reason || 'Suspended by admin'
  await server.save()

  res.json({ message: 'Server suspended.', server })
})

router.post('/servers/:id/unsuspend', async (req, res) => {
  const server = await Server.findById(req.params.id)
  if (!server) return res.status(404).json({ error: 'Server not found.' })

  if (server.pterodactylId) {
    try { await unsuspendServer(server.pterodactylId) } catch (e) { console.warn(e.message) }
  }

  server.status = 'offline'
  server.suspendReason = null
  await server.save()

  res.json({ message: 'Server unsuspended.', server })
})

router.delete('/servers/:id', async (req, res) => {
  const server = await Server.findById(req.params.id)
  if (!server) return res.status(404).json({ error: 'Server not found.' })

  if (server.pterodactylId) {
    try { await deletePteroServer(server.pterodactylId) } catch (e) { console.warn(e.message) }
  }

  server.status = 'deleted'
  await server.save()
  res.json({ message: 'Server deleted.' })
})

// ── PLAN MANAGEMENT ───────────────────────────────────────────
router.get('/plans', async (req, res) => {
  const plans = await Plan.find().sort({ sortOrder: 1 })
  res.json({ plans })
})

router.post('/plans', async (req, res) => {
  const plan = await Plan.create(req.body)
  res.status(201).json({ plan })
})

router.put('/plans/:id', async (req, res) => {
  const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
  if (!plan) return res.status(404).json({ error: 'Plan not found.' })
  res.json({ plan })
})

router.delete('/plans/:id', async (req, res) => {
  await Plan.findByIdAndDelete(req.params.id)
  res.json({ message: 'Plan deleted.' })
})

// ── TICKET MANAGEMENT ─────────────────────────────────────────
router.get('/tickets', async (req, res) => {
  const { status } = req.query
  const query = status ? { status } : {}
  const tickets = await Ticket.find(query)
    .populate('owner', 'username email')
    .sort({ createdAt: -1 })
  res.json({ tickets })
})

router.post('/tickets/:id/reply', async (req, res) => {
  const { message } = req.body
  const ticket = await Ticket.findById(req.params.id).populate('owner')
  if (!ticket) return res.status(404).json({ error: 'Ticket not found.' })

  ticket.messages.push({
    from: 'admin',
    sender: req.user._id,
    content: message,
  })
  ticket.status = 'in-progress'
  ticket.assignedTo = req.user._id
  await ticket.save()

  // Email user
  if (ticket.owner) {
    sendTicketReplyEmail(ticket.owner, ticket).catch(console.warn)
  }

  res.json({ ticket })
})

router.put('/tickets/:id/status', async (req, res) => {
  const { status } = req.body
  const ticket = await Ticket.findByIdAndUpdate(
    req.params.id,
    { status, ...(status === 'closed' ? { closedAt: new Date() } : {}) },
    { new: true }
  )
  if (!ticket) return res.status(404).json({ error: 'Ticket not found.' })
  res.json({ ticket })
})

// ── BILLING CONTROL ───────────────────────────────────────────
router.get('/payments', async (req, res) => {
  const payments = await Payment.find()
    .populate('user', 'username email')
    .populate('plan', 'name displayName')
    .sort({ createdAt: -1 })
    .limit(100)
  res.json({ payments })
})

// ── NODE MANAGEMENT ───────────────────────────────────────────
router.get('/nodes', async (req, res) => {
  const nodes = await Node.find().sort({ createdAt: -1 })
  res.json({ nodes })
})

router.post('/nodes', async (req, res) => {
  const node = await Node.create(req.body)
  res.status(201).json({ node })
})

router.put('/nodes/:id', async (req, res) => {
  const node = await Node.findByIdAndUpdate(req.params.id, req.body, { new: true })
  if (!node) return res.status(404).json({ error: 'Node not found.' })
  res.json({ node })
})

router.delete('/nodes/:id', async (req, res) => {
  const node = await Node.findById(req.params.id)
  if (!node) return res.status(404).json({ error: 'Node not found.' })
  // Check if any servers are on this node
  const serverCount = await Server.countDocuments({ node: req.params.id, status: { $ne: 'deleted' } })
  if (serverCount > 0) {
    return res.status(400).json({ error: `Cannot delete node with ${serverCount} active server(s). Migrate servers first.` })
  }
  await Node.findByIdAndDelete(req.params.id)
  res.json({ message: 'Node deleted.' })
})

module.exports = router
