const express = require('express')
const router = express.Router()
const { authenticate } = require('../middleware/auth')
const Server = require('../models/Server')
const { Plan, Node, Payment } = require('../models/models')
const { createPteroServer, sendPowerAction, deletePteroServer } = require('../utils/pterodactyl')
const { sendServerDeployedEmail } = require('../utils/email')

// All routes require authentication
router.use(authenticate)

// ── GET /api/servers — Get user's servers ─────────────────────
router.get('/', async (req, res) => {
  try {
    const servers = await Server.find({ owner: req.user._id, status: { $ne: 'deleted' } })
      .populate('plan', 'name displayName price')
      .populate('node', 'name location')
      .sort({ createdAt: -1 })

    res.json({ servers })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch servers.' })
  }
})

// ── POST /api/servers — Create new server ─────────────────────
router.post('/', async (req, res) => {
  try {
    const { name, type, version, planId } = req.body

    if (!name || !type || !version || !planId) {
      return res.status(400).json({ error: 'Missing required fields.' })
    }

    // Get plan
    const plan = await Plan.findById(planId)
    if (!plan || !plan.isActive) {
      return res.status(404).json({ error: 'Plan not found or unavailable.' })
    }

    // Auto-assign node (admin controlled — user cannot choose)
    const node = await Node.findOne({ status: 'online', isDefault: true }) ||
                 await Node.findOne({ status: 'online' })

    if (!node) {
      return res.status(503).json({ error: 'No nodes available. Contact support.' })
    }

    // Create server record
    const server = await Server.create({
      owner: req.user._id,
      name: name.trim(),
      type,
      version,
      plan: plan._id,
      node: node._id,
      resources: {
        ram: plan.resources.ram,
        cpu: plan.resources.cpu,
        disk: plan.resources.disk,
        databases: plan.resources.databases,
        backups: plan.resources.backups,
      },
      status: 'installing',
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    })

    // Deploy to Pterodactyl asynchronously
    if (process.env.NODE_ENV === 'production' && req.user.pterodactylId) {
      createPteroServer({
        name: server.name,
        pterodactylUserId: req.user.pterodactylId,
        nodeId: node.pterodactylNodeId,
        ram: plan.resources.ram,
        cpu: plan.resources.cpu,
        disk: plan.resources.disk,
        databases: plan.resources.databases,
        backups: plan.resources.backups,
      }).then(async (pteroServer) => {
        server.pterodactylId = pteroServer.uuid
        server.connection = {
          ip: node.ip,
          port: pteroServer.relationships?.allocations?.data?.[0]?.attributes?.port || 25565,
        }
        server.status = 'offline'
        await server.save()
        sendServerDeployedEmail(req.user, server).catch(console.warn)
      }).catch(err => {
        console.error('Pterodactyl deploy failed:', err.message)
      })
    } else {
      // Development: just set to online
      server.connection = { ip: '127.0.0.1', port: 25565 }
      server.status = 'offline'
      await server.save()
    }

    res.status(201).json({
      message: 'Server is being deployed.',
      server,
    })
  } catch (err) {
    console.error('Create server error:', err)
    res.status(500).json({ error: 'Failed to create server.' })
  }
})

// ── GET /api/servers/:id — Get server details ─────────────────
router.get('/:id', async (req, res) => {
  try {
    const server = await Server.findOne({ _id: req.params.id, owner: req.user._id })
      .populate('plan node')

    if (!server) return res.status(404).json({ error: 'Server not found.' })

    res.json({ server })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch server.' })
  }
})

// ── POST /api/servers/:id/power — Power action ───────────────
router.post('/:id/power', async (req, res) => {
  try {
    const { action } = req.body
    if (!['start', 'stop', 'restart', 'kill'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action.' })
    }

    const server = await Server.findOne({ _id: req.params.id, owner: req.user._id })
    if (!server) return res.status(404).json({ error: 'Server not found.' })
    if (server.status === 'suspended') return res.status(403).json({ error: 'Server is suspended.' })

    if (server.pterodactylId) {
      await sendPowerAction(server.pterodactylId, action)
    }

    // Update status optimistically
    const statusMap: Record<string, string> = { start: 'starting', stop: 'stopping', restart: 'starting', kill: 'offline' }
    server.status = statusMap[action] || server.status
    await server.save()

    res.json({ message: `Power action '${action}' sent.`, status: server.status })
  } catch (err) {
    res.status(500).json({ error: 'Failed to send power action.' })
  }
})

// ── DELETE /api/servers/:id — Delete server ───────────────────
router.delete('/:id', async (req, res) => {
  try {
    const server = await Server.findOne({ _id: req.params.id, owner: req.user._id })
    if (!server) return res.status(404).json({ error: 'Server not found.' })

    // Delete from Pterodactyl
    if (server.pterodactylId) {
      try {
        await deletePteroServer(server.pterodactylId)
      } catch (pteroErr) {
        console.warn('Pterodactyl delete failed:', pteroErr.message)
      }
    }

    server.status = 'deleted'
    await server.save()

    res.json({ message: 'Server deleted successfully.' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete server.' })
  }
})

module.exports = router
