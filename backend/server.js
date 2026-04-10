// ============================================================
// Cubiq Host — Backend Server
// Express + MongoDB + Socket.io
// ============================================================

require('dotenv').config()
const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const mongoose = require('mongoose')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')

const app = express()
const server = http.createServer(app)

// ── Socket.io Setup ──────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})

// ── Middleware ───────────────────────────────────────────────
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}))
app.use(morgan('dev'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests. Please try again later.' },
})
app.use('/api/', limiter)

// Strict limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many auth attempts. Please try again later.' },
})

// ── Database Connection ──────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cubiqhost')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message)
    process.exit(1)
  })

// ── Routes ───────────────────────────────────────────────────
const authRoutes      = require('./routes/auth')
const serverRoutes    = require('./routes/servers')
const ticketRoutes    = require('./routes/tickets')
const billingRoutes   = require('./routes/billing')
const adminRoutes     = require('./routes/admin')
const nodeRoutes      = require('./routes/nodes')
const botRoutes       = require('./routes/bots')

app.use('/api/auth',    authLimiter, authRoutes)
app.use('/api/servers', serverRoutes)
app.use('/api/tickets', ticketRoutes)
app.use('/api/billing', billingRoutes)
app.use('/api/admin',   adminRoutes)
app.use('/api/nodes',   nodeRoutes)
app.use('/api/bots',    botRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  })
})

// ── Socket.io Events ─────────────────────────────────────────
require('./utils/socketHandler')(io)

// ── 404 & Error Handlers ─────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

app.use((err, req, res, next) => {
  console.error('Server Error:', err)
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  })
})

// ── Start Server ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════╗
║        CUBIQ HOST BACKEND            ║
║  Server running on port ${PORT}          ║
║  Environment: ${process.env.NODE_ENV || 'development'}        ║
╚══════════════════════════════════════╝
  `)
})

module.exports = { app, io }
