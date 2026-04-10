const mongoose = require('mongoose')

// ── Plan Model ───────────────────────────────────────────────
const PlanSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  type: { type: String, enum: ['minecraft', 'bot'], default: 'minecraft' },
  price: { type: Number, required: true },              // INR per month
  resources: {
    ram: { type: Number, required: true },              // MB
    cpu: { type: Number, required: true },              // % (100 = 1 core)
    disk: { type: Number, required: true },             // MB
    databases: { type: Number, default: 1 },
    backups: { type: Number, default: 1 },
    maxPlayers: { type: Number, default: 20 },
    bandwidth: { type: String, default: 'Unlimited' },
  },
  features: [String],
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  sortOrder: { type: Number, default: 0 },
}, { timestamps: true })

// ── Ticket Model ─────────────────────────────────────────────
const MessageSchema = new mongoose.Schema({
  from: { type: String, enum: ['user', 'admin'], required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, maxlength: 5000 },
  createdAt: { type: Date, default: Date.now },
})

const TicketSchema = new mongoose.Schema({
  ticketId: { type: String, unique: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true, maxlength: 200 },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  status: { type: String, enum: ['open', 'in-progress', 'waiting', 'closed'], default: 'open' },
  category: { type: String, enum: ['billing', 'technical', 'general', 'abuse'], default: 'general' },
  relatedServer: { type: mongoose.Schema.Types.ObjectId, ref: 'Server', default: null },
  messages: [MessageSchema],
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  closedAt: Date,
}, { timestamps: true })

// Auto-generate ticket ID
TicketSchema.pre('save', async function (next) {
  if (!this.ticketId) {
    const count = await mongoose.model('Ticket').countDocuments()
    this.ticketId = `TKT-${String(count + 1).padStart(4, '0')}`
  }
  next()
})

// ── Payment Model ────────────────────────────────────────────
const PaymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  server: { type: mongoose.Schema.Types.ObjectId, ref: 'Server', default: null },
  plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', default: null },
  // Razorpay IDs
  razorpayOrderId: { type: String, unique: true, sparse: true },
  razorpayPaymentId: { type: String, unique: true, sparse: true },
  razorpaySignature: String,
  // Payment details
  amount: { type: Number, required: true },             // INR paise
  currency: { type: String, default: 'INR' },
  status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  description: String,
  invoiceId: { type: String, unique: true, sparse: true },
  // Billing period
  periodStart: Date,
  periodEnd: Date,
}, { timestamps: true })

PaymentSchema.index({ user: 1, createdAt: -1 })

// ── Node Model ───────────────────────────────────────────────
const NodeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: {
    country: { type: String, required: true },
    city: { type: String, required: true },
    region: { type: String, enum: ['india', 'us', 'europe', 'asia', 'australia'], required: true },
    flag: { type: String, default: '🌍' },
  },
  // Pterodactyl node ID
  pterodactylNodeId: { type: Number, required: true },
  // Status
  status: { type: String, enum: ['online', 'maintenance', 'offline'], default: 'online' },
  // Resources
  totalRam: { type: Number, required: true },           // MB
  usedRam: { type: Number, default: 0 },
  totalDisk: { type: Number, required: true },          // MB
  usedDisk: { type: Number, default: 0 },
  totalCpu: { type: Number, required: true },           // %
  usedCpu: { type: Number, default: 0 },
  // Network
  ip: { type: String, required: true },
  fqdn: String,
  // Latency (updated periodically)
  latency: { type: Number, default: 0 },                // ms
  // Visibility
  isPublic: { type: Boolean, default: false },          // Users cannot see/choose nodes
  isDefault: { type: Boolean, default: false },
  // Server types supported
  supportedTypes: [String],
}, { timestamps: true })

module.exports = {
  Plan: mongoose.model('Plan', PlanSchema),
  Ticket: mongoose.model('Ticket', TicketSchema),
  Payment: mongoose.model('Payment', PaymentSchema),
  Node: mongoose.model('Node', NodeSchema),
}
