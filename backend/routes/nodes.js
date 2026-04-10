// ── nodes.js ─────────────────────────────────────────────────
const express = require('express')
const nodeRouter = express.Router()
const { authenticate } = require('../middleware/auth')
const { Node } = require('../models/models')

nodeRouter.use(authenticate)

// Users can only see node names/locations (not internal details)
nodeRouter.get('/', async (req, res) => {
  const nodes = await Node.find({ status: 'online' })
    .select('name location status latency')
    .sort({ 'location.region': 1 })
  res.json({ nodes })
})

module.exports = nodeRouter
