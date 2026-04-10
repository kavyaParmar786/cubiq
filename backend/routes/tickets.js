// ============================================================
// tickets.js — Ticket routes
// ============================================================
const express = require('express')
const ticketRouter = express.Router()
const { authenticate } = require('../middleware/auth')
const { Ticket } = require('../models/models')
const { sendTicketReplyEmail } = require('../utils/email')

ticketRouter.use(authenticate)

// GET /api/tickets
ticketRouter.get('/', async (req, res) => {
  const tickets = await Ticket.find({ owner: req.user._id }).sort({ updatedAt: -1 })
  res.json({ tickets })
})

// POST /api/tickets
ticketRouter.post('/', async (req, res) => {
  const { subject, priority, category, message, relatedServer } = req.body
  if (!subject || !message) return res.status(400).json({ error: 'Subject and message required.' })

  const ticket = await Ticket.create({
    owner: req.user._id,
    subject, priority, category,
    relatedServer: relatedServer || null,
    messages: [{ from: 'user', sender: req.user._id, content: message }],
  })

  res.status(201).json({ ticket })
})

// POST /api/tickets/:id/reply
ticketRouter.post('/:id/reply', async (req, res) => {
  const { message } = req.body
  const ticket = await Ticket.findOne({ _id: req.params.id, owner: req.user._id })
  if (!ticket) return res.status(404).json({ error: 'Ticket not found.' })
  if (ticket.status === 'closed') return res.status(400).json({ error: 'Ticket is closed.' })

  ticket.messages.push({ from: 'user', sender: req.user._id, content: message })
  ticket.status = 'waiting'
  await ticket.save()

  res.json({ ticket })
})

// PUT /api/tickets/:id/close
ticketRouter.put('/:id/close', async (req, res) => {
  const ticket = await Ticket.findOne({ _id: req.params.id, owner: req.user._id })
  if (!ticket) return res.status(404).json({ error: 'Ticket not found.' })

  ticket.status = 'closed'
  ticket.closedAt = new Date()
  await ticket.save()

  res.json({ message: 'Ticket closed.', ticket })
})

module.exports = ticketRouter
