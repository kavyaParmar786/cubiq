// ── Pterodactyl API — called only from Next.js API routes ────
// NEVER expose this in client components

const PTERO_URL = process.env.PTERODACTYL_URL
const PTERO_APP_KEY = process.env.PTERODACTYL_API_KEY       // Application API key
const PTERO_CLIENT_KEY = process.env.PTERODACTYL_CLIENT_KEY  // Client API key (optional)

async function pteroFetch(
  path: string,
  options: RequestInit = {},
  useClientApi = false
) {
  const key = useClientApi ? PTERO_CLIENT_KEY : PTERO_APP_KEY
  const base = useClientApi ? `${PTERO_URL}/api/client` : `${PTERO_URL}/api/application`

  const res = await fetch(`${base}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    },
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Pterodactyl ${res.status}: ${err}`)
  }

  return res.status === 204 ? null : res.json()
}

// ── User Management ───────────────────────────────────────────

export async function pteroCreateUser(email: string, username: string, firstName: string, password: string) {
  const data = await pteroFetch('/users', {
    method: 'POST',
    body: JSON.stringify({ email, username, first_name: firstName, last_name: 'User', password }),
  })
  return data.attributes as { id: number; uuid: string; email: string }
}

export async function pteroDeleteUser(pterodactylId: number) {
  await pteroFetch(`/users/${pterodactylId}`, { method: 'DELETE' })
}

// ── Server Management ─────────────────────────────────────────

interface CreateServerOpts {
  name: string
  pterodactylUserId: number
  nodeId: number
  ram: number    // MB
  cpu: number    // % (100 = 1 core)
  disk: number   // MB
  databases?: number
  backups?: number
  eggId?: number
  startupCmd?: string
  environment?: Record<string, string>
}

export async function pteroCreateServer(opts: CreateServerOpts) {
  const eggId = opts.eggId || parseInt(process.env.PTERODACTYL_PAPER_EGG_ID || '1')

  const data = await pteroFetch('/servers', {
    method: 'POST',
    body: JSON.stringify({
      name: opts.name,
      user: opts.pterodactylUserId,
      egg: eggId,
      docker_image: 'ghcr.io/pterodactyl/yolks:java_17',
      startup: opts.startupCmd || 'java -Xms128M -Xmx{{SERVER_MEMORY}}M -jar {{SERVER_JARFILE}}',
      environment: {
        SERVER_JARFILE: 'server.jar',
        BUILD_NUMBER: 'latest',
        MINECRAFT_VERSION: '1.20.4',
        ...opts.environment,
      },
      limits: {
        memory: opts.ram,
        swap: 0,
        disk: opts.disk,
        io: 500,
        cpu: opts.cpu,
      },
      feature_limits: {
        databases: opts.databases ?? 1,
        backups: opts.backups ?? 1,
        allocations: 1,
      },
      deploy: {
        locations: [opts.nodeId],
        dedicated_ip: false,
        port_range: [],
      },
    }),
  })
  return data.attributes as { id: number; uuid: string; identifier: string }
}

export async function pteroSuspendServer(serverId: number) {
  await pteroFetch(`/servers/${serverId}/suspend`, { method: 'POST' })
}

export async function pteroUnsuspendServer(serverId: number) {
  await pteroFetch(`/servers/${serverId}/unsuspend`, { method: 'POST' })
}

export async function pteroDeleteServer(serverId: number) {
  await pteroFetch(`/servers/${serverId}`, { method: 'DELETE' })
}

// ── Server Resources (Client API) ─────────────────────────────

export async function pteroGetResources(serverIdentifier: string) {
  const data = await pteroFetch(`/servers/${serverIdentifier}/resources`, {}, true)
  return data.attributes as {
    current_state: string
    resources: {
      cpu_absolute: number
      memory_bytes: number
      disk_bytes: number
      network_rx_bytes: number
      network_tx_bytes: number
      uptime: number
    }
  }
}

export async function pteroPowerAction(
  serverIdentifier: string,
  signal: 'start' | 'stop' | 'restart' | 'kill'
) {
  await pteroFetch(`/servers/${serverIdentifier}/power`, {
    method: 'POST',
    body: JSON.stringify({ signal }),
  }, true)
}

export async function pteroSendCommand(serverIdentifier: string, command: string) {
  await pteroFetch(`/servers/${serverIdentifier}/command`, {
    method: 'POST',
    body: JSON.stringify({ command }),
  }, true)
}

export async function pteroListFiles(serverIdentifier: string, directory = '/') {
  const data = await pteroFetch(
    `/servers/${serverIdentifier}/files/list?directory=${encodeURIComponent(directory)}`,
    {}, true
  )
  return data.data as Array<{ attributes: { name: string; is_file: boolean; size: number; modified_at: string } }>
}

export async function pteroGetFileContent(serverIdentifier: string, file: string) {
  const res = await fetch(
    `${PTERO_URL}/api/client/servers/${serverIdentifier}/files/contents?file=${encodeURIComponent(file)}`,
    {
      headers: {
        'Authorization': `Bearer ${PTERO_CLIENT_KEY}`,
        'Accept': 'application/json',
      },
    }
  )
  return res.text()
}

// ── Modpack Installation ──────────────────────────────────────

const MODPACK_EGGS: Record<string, { eggId: number; startup: string; env: Record<string, string> }> = {
  paper: {
    eggId: parseInt(process.env.PTERODACTYL_PAPER_EGG_ID || '1'),
    startup: 'java -Xms128M -Xmx{{SERVER_MEMORY}}M -jar {{SERVER_JARFILE}}',
    env: { SERVER_JARFILE: 'server.jar', BUILD_NUMBER: 'latest', MINECRAFT_VERSION: '1.20.4' },
  },
  forge: {
    eggId: parseInt(process.env.PTERODACTYL_FORGE_EGG_ID || '2'),
    startup: 'java -Xms128M -Xmx{{SERVER_MEMORY}}M -jar {{SERVER_JARFILE}}',
    env: { SERVER_JARFILE: 'server.jar', MINECRAFT_VERSION: '1.20.1', FORGE_VERSION: 'latest' },
  },
  fabric: {
    eggId: parseInt(process.env.PTERODACTYL_FABRIC_EGG_ID || '3'),
    startup: 'java -Xms128M -Xmx{{SERVER_MEMORY}}M -jar {{SERVER_JARFILE}}',
    env: { SERVER_JARFILE: 'server.jar', MINECRAFT_VERSION: '1.20.4', LOADER_VERSION: 'latest' },
  },
  vanilla: {
    eggId: parseInt(process.env.PTERODACTYL_VANILLA_EGG_ID || '4'),
    startup: 'java -Xms128M -Xmx{{SERVER_MEMORY}}M -jar {{SERVER_JARFILE}}',
    env: { SERVER_JARFILE: 'server.jar', MINECRAFT_VERSION: '1.20.4' },
  },
}

export async function pteroInstallModpack(serverId: number, modpackId: string) {
  const modpack = MODPACK_EGGS[modpackId]
  if (!modpack) throw new Error(`Unknown modpack: ${modpackId}`)

  // Update server startup config (reinstall)
  await pteroFetch(`/servers/${serverId}/startup`, {
    method: 'PATCH',
    body: JSON.stringify({
      startup: modpack.startup,
      environment: modpack.env,
      egg: modpack.eggId,
      skip_scripts: false,
    }),
  })

  // Trigger reinstall
  await pteroFetch(`/servers/${serverId}/reinstall`, { method: 'POST' })
}
