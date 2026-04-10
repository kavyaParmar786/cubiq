const mongoose = require('mongoose')

const ServerSchema = new mongoose.Schema({
  // Owner
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // Server details
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 32,
  },
  type: {
    type: String,
    enum: ['vanilla', 'paper', 'spigot', 'forge', 'fabric', 'bungeecord', 'velocity', 'purpur'],
    default: 'paper',
  },
  version: {
    type: String,
    required: true,
    default: '1.20.4',
  },
  // Pterodactyl panel server ID
  pterodactylId: {
    type: String,
    unique: true,
    sparse: true,
  },
  // Node assignment (admin controlled only)
  node: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Node',
    required: true,
  },
  // Plan reference
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: true,
  },
  // Resources
  resources: {
    ram: { type: Number, required: true },     // MB
    cpu: { type: Number, required: true },      // % (100 = 1 core)
    disk: { type: Number, required: true },     // MB
    databases: { type: Number, default: 1 },
    backups: { type: Number, default: 1 },
  },
  // Connection info
  connection: {
    ip: String,
    port: { type: Number, default: 25565 },
    domain: String,
  },
  // Status
  status: {
    type: String,
    enum: ['installing', 'online', 'offline', 'starting', 'stopping', 'suspended', 'deleted'],
    default: 'installing',
  },
  // Installed modpack
  modpack: {
    type: String,
    default: null,
  },
  // Billing
  billingCycle: {
    type: String,
    enum: ['monthly', 'quarterly', 'annually'],
    default: 'monthly',
  },
  nextBillingDate: Date,
  // Suspend reason
  suspendReason: String,
}, {
  timestamps: true,
})

// Indexes
ServerSchema.index({ owner: 1 })
ServerSchema.index({ pterodactylId: 1 })
ServerSchema.index({ status: 1 })

module.exports = mongoose.model('Server', ServerSchema)
