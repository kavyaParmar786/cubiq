const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')
const crypto = require('crypto')

const User = require('../models/User')
const { authenticate, generateToken } = require('../middleware/auth')
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../utils/email')
const { createPteroUser } = require('../utils/pterodactyl')

// ── POST /api/auth/register ───────────────────────────────────
router.post('/register', [
  body('username').trim().isLength({ min: 3, max: 20 }).matches(/^[a-zA-Z0-9_-]+$/),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg })
    }

    const { username, email, password } = req.body

    // Check duplicates
    const existing = await User.findOne({ $or: [{ email }, { username }] })
    if (existing) {
      const field = existing.email === email ? 'Email' : 'Username'
      return res.status(409).json({ error: `${field} is already registered.` })
    }

    // Create user
    const user = await User.create({ username, email, password })

    // Create Pterodactyl account (non-blocking in prod)
    try {
      const pteroUser = await createPteroUser(email, username, username, password)
      user.pterodactylId = pteroUser.id
      await user.save()
    } catch (pteroErr) {
      console.warn('Pterodactyl user creation failed (non-fatal):', pteroErr.message)
    }

    // Send welcome email (non-blocking)
    sendWelcomeEmail(user).catch(console.warn)

    const token = generateToken(user._id)

    res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    })
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ error: 'Registration failed. Please try again.' })
  }
})

// ── POST /api/auth/login ──────────────────────────────────────
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid email or password format.' })
    }

    const { email, password } = req.body

    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' })
    }

    if (user.status === 'banned') {
      return res.status(403).json({ error: 'Your account has been banned.' })
    }

    const token = generateToken(user._id)

    res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Login failed. Please try again.' })
  }
})

// ── GET /api/auth/me ──────────────────────────────────────────
router.get('/me', authenticate, async (req, res) => {
  res.json({ user: req.user })
})

// ── POST /api/auth/forgot-password ───────────────────────────
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail(),
], async (req, res) => {
  try {
    const { email } = req.body
    const user = await User.findOne({ email })

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ message: 'If that email exists, a reset link has been sent.' })
    }

    const token = crypto.randomBytes(32).toString('hex')
    user.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex')
    user.passwordResetExpires = Date.now() + 3600000 // 1 hour
    await user.save()

    await sendPasswordResetEmail(user, token)

    res.json({ message: 'If that email exists, a reset link has been sent.' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to process request.' })
  }
})

// ── POST /api/auth/reset-password ────────────────────────────
router.post('/reset-password', [
  body('token').notEmpty(),
  body('password').isLength({ min: 8 }),
], async (req, res) => {
  try {
    const { token, password } = req.body
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({ error: 'Token is invalid or has expired.' })
    }

    user.password = password
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save()

    res.json({ message: 'Password reset successfully. You can now log in.' })
  } catch (err) {
    res.status(500).json({ error: 'Password reset failed.' })
  }
})

module.exports = router
