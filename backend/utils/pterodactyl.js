const axios = require('axios')

// ── Pterodactyl API Client ───────────────────────────────────
const ptero = axios.create({
  baseURL: `${process.env.PTERODACTYL_URL}/api/application`,
  headers: {
    'Authorization': `Bearer ${process.env.PTERODACTYL_API_KEY}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 15000,
})

const pteroClient = axios.create({
  baseURL: `${process.env.PTERODACTYL_URL}/api/client`,
  headers: {
    'Authorization': `Bearer ${process.env.PTERODACTYL_API_KEY}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 15000,
})

// ── User Operations ──────────────────────────────────────────

/**
 * Create a user in Pterodactyl
 */
async function createPteroUser(email, username, firstName, password) {
  const res = await ptero.post('/users', {
    email,
    username,
    first_name: firstName,
    last_name: 'User',
    password,
  })
  return res.data.attributes
}

/**
 * Delete a user from Pterodactyl
 */
async function deletePteroUser(pterodactylId) {
  await ptero.delete(`/users/${pterodactylId}`)
}

// ── Server Operations ────────────────────────────────────────

/**
 * Create a server on Pterodactyl
 * @param {Object} opts - Server configuration
 */
async function createPteroServer({ name, pterodactylUserId, nodeId, ram, cpu, disk, databases, backups }) {
  // Egg IDs for Paper Minecraft (adjust for your panel setup)
  const PAPER_EGG_ID = 1
  const NEST_ID = 1

  const res = await ptero.post('/servers', {
    name,
    user: pterodactylUserId,
    egg: PAPER_EGG_ID,
    docker_image: 'ghcr.io/pterodactyl/yolks:java_17',
    startup: 'java -Xms128M -Xmx{{SERVER_MEMORY}}M -jar {{SERVER_JARFILE}}',
    environment: {
      SERVER_JARFILE: 'server.jar',
      BUILD_NUMBER: 'latest',
      MINECRAFT_VERSION: '1.20.4',
    },
    limits: {
      memory: ram,
      swap: 0,
      disk: disk,
      io: 500,
      cpu: cpu,
    },
    feature_limits: {
      databases: databases,
      backups: backups,
      allocations: 1,
    },
    deploy: {
      locations: [nodeId],
      dedicated_ip: false,
      port_range: [],
    },
  })
  return res.data.attributes
}

/**
 * Get server status from Pterodactyl
 */
async function getPteroServerStatus(serverUuid) {
  const res = await pteroClient.get(`/servers/${serverUuid}/resources`)
  return res.data.attributes
}

/**
 * Send power action to server (start, stop, restart, kill)
 */
async function sendPowerAction(serverUuid, action) {
  await pteroClient.post(`/servers/${serverUuid}/power`, { signal: action })
}

/**
 * Suspend a server
 */
async function suspendServer(pterodactylId) {
  await ptero.post(`/servers/${pterodactylId}/suspend`)
}

/**
 * Unsuspend a server
 */
async function unsuspendServer(pterodactylId) {
  await ptero.post(`/servers/${pterodactylId}/unsuspend`)
}

/**
 * Delete a server from Pterodactyl
 */
async function deletePteroServer(pterodactylId) {
  await ptero.delete(`/servers/${pterodactylId}`)
}

/**
 * Get server console logs
 */
async function getServerLogs(serverUuid) {
  const res = await pteroClient.get(`/servers/${serverUuid}/logs`)
  return res.data
}

/**
 * Send console command
 */
async function sendCommand(serverUuid, command) {
  await pteroClient.post(`/servers/${serverUuid}/command`, { command })
}

module.exports = {
  createPteroUser,
  deletePteroUser,
  createPteroServer,
  getPteroServerStatus,
  sendPowerAction,
  suspendServer,
  unsuspendServer,
  deletePteroServer,
  getServerLogs,
  sendCommand,
}
