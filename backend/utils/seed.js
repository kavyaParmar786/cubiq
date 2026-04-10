// ── Database Seeder ───────────────────────────────────────────
// Run: node backend/utils/seed.js
// Seeds default admin, plans, and a sample node

require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('./models/User')
const { Plan, Node } = require('./models/models')

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cubiqhost')
  console.log('Connected to MongoDB')

  // ── Clear existing seed data ──────────────────────────────
  await Plan.deleteMany({})
  await Node.deleteMany({})

  // ── Create admin user ─────────────────────────────────────
  const existingAdmin = await User.findOne({ email: process.env.ADMIN_EMAIL || 'admin@cubiqhost.com' })
  if (!existingAdmin) {
    await User.create({
      username: 'CubiqAdmin',
      email: process.env.ADMIN_EMAIL || 'admin@cubiqhost.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@123456',
      role: 'admin',
      status: 'active',
      emailVerified: true,
    })
    console.log('✅ Admin user created')
  } else {
    console.log('⏭ Admin user already exists')
  }

  // ── Minecraft Plans ───────────────────────────────────────
  const mcPlans = [
    {
      name: 'dirt',
      displayName: 'DIRT',
      type: 'minecraft',
      price: 99,
      resources: { ram: 1024, cpu: 100, disk: 10240, databases: 1, backups: 1, maxPlayers: 5, bandwidth: '1TB' },
      features: ['Vanilla/Paper/Spigot', 'Basic DDoS Protection', '1 Daily Backup', 'Standard Support'],
      isActive: true,
      sortOrder: 1,
    },
    {
      name: 'iron',
      displayName: 'IRON',
      type: 'minecraft',
      price: 179,
      resources: { ram: 2048, cpu: 100, disk: 20480, databases: 1, backups: 3, maxPlayers: 15, bandwidth: '2TB' },
      features: ['All Server Types', 'Enhanced DDoS', '3 Daily Backups', 'Standard Support', 'Plugin Installer'],
      isActive: true,
      sortOrder: 2,
    },
    {
      name: 'diamond',
      displayName: 'DIAMOND',
      type: 'minecraft',
      price: 349,
      resources: { ram: 4096, cpu: 200, disk: 40960, databases: 2, backups: 5, maxPlayers: 30, bandwidth: '5TB' },
      features: ['All Server Types', 'Advanced DDoS', 'Hourly Backups', 'Priority Support', 'Custom Domain', 'Plugin + Modpacks'],
      isActive: true,
      isFeatured: true,
      sortOrder: 3,
    },
    {
      name: 'emerald',
      displayName: 'EMERALD',
      type: 'minecraft',
      price: 599,
      resources: { ram: 8192, cpu: 300, disk: 61440, databases: 3, backups: 10, maxPlayers: 60, bandwidth: '10TB' },
      features: ['All Server Types', 'Advanced DDoS', 'Hourly Backups', 'Priority Support (1h)', 'Dedicated IP', 'All Modpacks', 'BungeeCord Ready'],
      isActive: true,
      sortOrder: 4,
    },
    {
      name: 'netherite',
      displayName: 'NETHERITE',
      type: 'minecraft',
      price: 999,
      resources: { ram: 16384, cpu: 400, disk: 102400, databases: 5, backups: 20, maxPlayers: 999, bandwidth: 'Unlimited' },
      features: ['All Features', 'Maximum DDoS (1Tbps)', 'Real-time Backups', 'Priority Support (30min)', 'Dedicated IP', 'All Modpacks', 'BungeeCord/Velocity'],
      isActive: true,
      sortOrder: 5,
    },
  ]

  const botPlans = [
    {
      name: 'bot-starter',
      displayName: 'BOT STARTER',
      type: 'bot',
      price: 79,
      resources: { ram: 512, cpu: 50, disk: 5120, databases: 0, backups: 0, bandwidth: 'Unlimited' },
      features: ['Node.js / Python', '1 Bot Instance', 'Basic Support'],
      isActive: true,
      sortOrder: 10,
    },
    {
      name: 'bot-pro',
      displayName: 'BOT PRO',
      type: 'bot',
      price: 149,
      resources: { ram: 1024, cpu: 100, disk: 15360, databases: 0, backups: 0, bandwidth: 'Unlimited' },
      features: ['Node.js / Python / Go', '3 Bot Instances', 'Priority Support'],
      isActive: true,
      isFeatured: true,
      sortOrder: 11,
    },
    {
      name: 'bot-ultra',
      displayName: 'BOT ULTRA',
      type: 'bot',
      price: 299,
      resources: { ram: 2048, cpu: 200, disk: 30720, databases: 0, backups: 0, bandwidth: 'Unlimited' },
      features: ['All Runtimes', 'Unlimited Bots', 'Priority Support (1h)'],
      isActive: true,
      sortOrder: 12,
    },
  ]

  await Plan.insertMany([...mcPlans, ...botPlans])
  console.log(`✅ ${mcPlans.length + botPlans.length} plans created`)

  // ── Sample Nodes ──────────────────────────────────────────
  const nodes = [
    {
      name: 'Mumbai IN-1',
      location: { country: 'India', city: 'Mumbai', region: 'india', flag: '🇮🇳' },
      pterodactylNodeId: 1,
      status: 'online',
      totalRam: 131072, // 128 GB
      totalDisk: 2097152, // 2 TB
      totalCpu: 3200, // 32 cores
      ip: '103.x.x.x',
      fqdn: 'node1.mumbai.cubiqhost.com',
      latency: 4,
      isPublic: false,
      isDefault: true,
    },
    {
      name: 'Delhi IN-1',
      location: { country: 'India', city: 'Delhi', region: 'india', flag: '🇮🇳' },
      pterodactylNodeId: 2,
      status: 'online',
      totalRam: 65536,
      totalDisk: 1048576,
      totalCpu: 1600,
      ip: '49.x.x.x',
      fqdn: 'node1.delhi.cubiqhost.com',
      latency: 6,
      isPublic: false,
      isDefault: false,
    },
    {
      name: 'US East-1',
      location: { country: 'United States', city: 'New York', region: 'us', flag: '🇺🇸' },
      pterodactylNodeId: 3,
      status: 'online',
      totalRam: 131072,
      totalDisk: 2097152,
      totalCpu: 3200,
      ip: '45.x.x.x',
      fqdn: 'node1.us-east.cubiqhost.com',
      latency: 120,
      isPublic: false,
      isDefault: false,
    },
    {
      name: 'EU West-1',
      location: { country: 'Germany', city: 'Frankfurt', region: 'europe', flag: '🇩🇪' },
      pterodactylNodeId: 4,
      status: 'online',
      totalRam: 131072,
      totalDisk: 2097152,
      totalCpu: 3200,
      ip: '88.x.x.x',
      fqdn: 'node1.eu-west.cubiqhost.com',
      latency: 180,
      isPublic: false,
      isDefault: false,
    },
    {
      name: 'Singapore SG-1',
      location: { country: 'Singapore', city: 'Singapore', region: 'asia', flag: '🇸🇬' },
      pterodactylNodeId: 5,
      status: 'online',
      totalRam: 65536,
      totalDisk: 1048576,
      totalCpu: 1600,
      ip: '27.x.x.x',
      fqdn: 'node1.singapore.cubiqhost.com',
      latency: 9,
      isPublic: false,
      isDefault: false,
    },
  ]

  await Node.insertMany(nodes)
  console.log(`✅ ${nodes.length} nodes created`)

  console.log('\n🎮 Cubiq Host database seeded successfully!')
  console.log('Admin:', process.env.ADMIN_EMAIL || 'admin@cubiqhost.com')
  console.log('Password:', process.env.ADMIN_PASSWORD || 'Admin@123456')

  await mongoose.disconnect()
  process.exit(0)
}

seed().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})
