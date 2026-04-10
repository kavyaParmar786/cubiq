const jwt = require('jsonwebtoken')
const User = require('../models/User')
const Server = require('../models/Server')
const { getPteroServerStatus } = require('./pterodactyl')

// ── Socket.io Handler ────────────────────────────────────────
module.exports = (io) => {
  // Auth middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token
      if (!token) return next(new Error('Authentication required'))

      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const user = await User.findById(decoded.id)
      if (!user) return next(new Error('User not found'))

      socket.user = user
      next()
    } catch (err) {
      next(new Error('Invalid token'))
    }
  })

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.user.username} (${socket.id})`)

    // Join user-specific room
    socket.join(`user:${socket.user._id}`)

    // ── Subscribe to server stats ─────────────────────────────
    socket.on('subscribe:server', async (serverId) => {
      try {
        const server = await Server.findOne({
          _id: serverId,
          owner: socket.user._id,
        })

        if (!server) {
          socket.emit('error', { message: 'Server not found or unauthorized' })
          return
        }

        // Join server room
        socket.join(`server:${serverId}`)
        console.log(`📊 ${socket.user.username} subscribed to server ${serverId}`)

        // Start emitting live stats (mock if no Pterodactyl in dev)
        const statsInterval = setInterval(async () => {
          try {
            let stats

            if (process.env.NODE_ENV === 'production' && server.pterodactylId) {
              // Real stats from Pterodactyl
              stats = await getPteroServerStatus(server.pterodactylId)
            } else {
              // Mock stats for development
              stats = {
                current_state: 'running',
                resources: {
                  cpu_absolute: parseFloat((Math.random() * 50 + 10).toFixed(1)),
                  memory_bytes: Math.floor(Math.random() * 2 * 1024 * 1024 * 1024),
                  disk_bytes: Math.floor(Math.random() * 10 * 1024 * 1024 * 1024),
                  network: {
                    rx_bytes: Math.floor(Math.random() * 1000000),
                    tx_bytes: Math.floor(Math.random() * 500000),
                  },
                  uptime: Date.now() - Math.floor(Math.random() * 1000000000),
                },
              }
            }

            socket.emit('server:stats', {
              serverId,
              timestamp: Date.now(),
              cpu: stats.resources.cpu_absolute,
              ram: Math.round(stats.resources.memory_bytes / (1024 * 1024)), // MB
              disk: Math.round(stats.resources.disk_bytes / (1024 * 1024)), // MB
              network: stats.resources.network,
              state: stats.current_state,
              uptime: stats.resources.uptime,
            })
          } catch (err) {
            console.error('Stats error:', err.message)
          }
        }, 3000) // Every 3 seconds

        // Clean up on unsubscribe
        socket.on('unsubscribe:server', (id) => {
          if (id === serverId) {
            clearInterval(statsInterval)
            socket.leave(`server:${serverId}`)
          }
        })

        socket.on('disconnect', () => {
          clearInterval(statsInterval)
        })

      } catch (err) {
        socket.emit('error', { message: 'Failed to subscribe to server stats' })
      }
    })

    // ── Console streaming ─────────────────────────────────────
    socket.on('console:subscribe', async (serverId) => {
      socket.join(`console:${serverId}`)

      // Mock console messages in dev
      if (process.env.NODE_ENV !== 'production') {
        const mockLogs = [
          '[INFO] Server running on port 25565',
          '[INFO] Player Steve joined the game',
          '[INFO] Player count: 5/20',
          '[WARN] Saving world...',
          '[INFO] World saved.',
        ]

        let logIndex = 0
        const logInterval = setInterval(() => {
          if (logIndex < mockLogs.length) {
            socket.emit('console:line', {
              serverId,
              line: mockLogs[logIndex],
              timestamp: new Date().toISOString(),
            })
            logIndex++
          }
        }, 2000)

        socket.on('console:unsubscribe', () => clearInterval(logInterval))
        socket.on('disconnect', () => clearInterval(logInterval))
      }
    })

    // ── Ticket notifications ──────────────────────────────────
    // Admins join the admin room for real-time ticket alerts
    if (socket.user.role === 'admin') {
      socket.join('admin:room')
    }

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.user.username}`)
    })
  })

  // ── Utility: Emit to specific user ───────────────────────────
  io.emitToUser = (userId, event, data) => {
    io.to(`user:${userId}`).emit(event, data)
  }

  // ── Utility: Emit to all admins ──────────────────────────────
  io.emitToAdmins = (event, data) => {
    io.to('admin:room').emit(event, data)
  }
}
