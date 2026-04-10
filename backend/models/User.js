const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [20, 'Username cannot exceed 20 characters'],
    match: [/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores and hyphens'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false, // Never returned in queries by default
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'banned'],
    default: 'active',
  },
  // Pterodactyl Panel user ID (assigned after creation)
  pterodactylId: {
    type: Number,
    default: null,
  },
  // Email verified
  emailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerifyToken: String,
  // Password reset
  passwordResetToken: String,
  passwordResetExpires: Date,
  // Profile
  avatar: {
    type: String,
    default: null,
  },
  // Credits / balance for billing
  balance: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
})

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(12)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

// Compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

// Remove sensitive fields from JSON output
UserSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.password
  delete obj.emailVerifyToken
  delete obj.passwordResetToken
  delete obj.passwordResetExpires
  return obj
}

module.exports = mongoose.model('User', UserSchema)
