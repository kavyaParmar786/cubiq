const express = require('express')
const router = express.Router()
const { authenticate } = require('../middleware/auth')

// Bot model (inline schema — can be separated)
const mongoose = require('mongoose')

const BotSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, maxlength: 32 },
  runtime: { type: String, enum: ['nodejs', 'python', 'go', 'java'], default: 'nodejs' },
  startCommand: { type: String, default: 'node index.js' },
  status: { type: String, enum: ['online', 'offline', 'installing', 'crashed'], default: 'offline' },
  pterodactylId: String,
  plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
  resources: {
    ram: { type: Number, default: 512 },
    cpu: { type: Number, default: 50 },
    disk: { type: Number, default: 5120 },
  },
  uptime: { type: Number, default: 0 },
  crashCount: { type: Number, default: 0 },
  autoRestart: { type: Boolean, default: true },
  envVars: [{ key: String, value: String }],
}, { timestamps: true })

const Bot = mongoose.models.Bot || mongoose.model('Bot', BotSchema)

router.use(authenticate)

// ── GET /api/bots ─────────────────────────────────────────────
router.get('/', async (req, res) => {
  const bots = await Bot.find({ owner: req.user._id }).sort({ createdAt: -1 })
  res.json({ bots })
})

// ── POST /api/bots ────────────────────────────────────────────
router.post('/', async (req, res) => {
  const { name, runtime, startCommand, planId } = req.body
  if (!name) return res.status(400).json({ error: 'Bot name is required.' })

  const bot = await Bot.create({
    owner: req.user._id,
    name: name.trim(),
    runtime: runtime || 'nodejs',
    startCommand: startCommand || 'node index.js',
    plan: planId || null,
    status: 'installing',
  })

  // Simulate install
  setTimeout(async () => {
    bot.status = 'online'
    await bot.save()
  }, 5000)

  res.status(201).json({ bot })
})

// ── POST /api/bots/:id/power ──────────────────────────────────
router.post('/:id/power', async (req, res) => {
  const { action } = req.body
  if (!['start', 'stop', 'restart'].includes(action)) {
    return res.status(400).json({ error: 'Invalid action.' })
  }

  const bot = await Bot.findOne({ _id: req.params.id, owner: req.user._id })
  if (!bot) return res.status(404).json({ error: 'Bot not found.' })

  bot.status = action === 'start' ? 'online' : action === 'stop' ? 'offline' : 'online'
  await bot.save()

  res.json({ message: `Bot ${action} successful.`, status: bot.status })
})

// ── DELETE /api/bots/:id ──────────────────────────────────────
router.delete('/:id', async (req, res) => {
  await Bot.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
  res.json({ message: 'Bot deleted.' })
})

// ── PUT /api/bots/:id/env ─────────────────────────────────────
router.put('/:id/env', async (req, res) => {
  const { envVars } = req.body
  const bot = await Bot.findOneAndUpdate(
    { _id: req.params.id, owner: req.user._id },
    { envVars },
    { new: true }
  )
  if (!bot) return res.status(404).json({ error: 'Bot not found.' })
  res.json({ bot })
})

module.exports = router
