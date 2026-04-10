const jwt = require('jsonwebtoken')
const User = require('../models/User')

// ── Authenticate JWT ─────────────────────────────────────────
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required. No token provided.' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Attach user to request (without password)
    const user = await User.findById(decoded.id).select('-password')
    if (!user) {
      return res.status(401).json({ error: 'User not found.' })
    }
    if (user.status === 'banned') {
      return res.status(403).json({ error: 'Your account has been banned. Contact support.' })
    }
    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'Your account is suspended. Contact support.' })
    }

    req.user = user
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please log in again.' })
    }
    return res.status(401).json({ error: 'Invalid token.' })
  }
}

// ── Admin Only ───────────────────────────────────────────────
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' })
  }
  next()
}

// ── Generate JWT ─────────────────────────────────────────────
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

module.exports = { authenticate, adminOnly, generateToken }
