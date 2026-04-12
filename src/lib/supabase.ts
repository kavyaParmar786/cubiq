// ── Browser-safe Supabase client ─────────────────────────────
// This file is safe to import in client components AND server components.
// It does NOT import next/headers — that lives in supabase-server.ts only.

import { createBrowserClient } from '@supabase/ssr'

// ── TypeScript types matching schema ─────────────────────────
export type UserRole = 'user' | 'admin'
export type ServerStatus =
  | 'installing' | 'online' | 'offline'
  | 'starting' | 'stopping' | 'suspended' | 'deleted'
export type TicketStatus = 'open' | 'in-progress' | 'waiting' | 'closed'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export interface Profile {
  id: string
  username: string
  email: string
  role: UserRole
  status: string
  pterodactyl_id: number | null
  balance: number
  created_at: string
  updated_at: string
}

export interface Plan {
  id: string
  name: string
  display_name: string
  type: 'minecraft' | 'bot'
  price: number
  ram: number
  cpu: number
  disk: number
  databases: number
  backups: number
  max_players: number
  bandwidth: string
  features: string[]
  is_active: boolean
  is_featured: boolean
  sort_order: number
}

export interface Server {
  id: string
  user_id: string
  pterodactyl_server_id: string | null
  pterodactyl_uuid: string | null
  plan_id: string | null
  node_id: string | null
  name: string
  type: string
  version: string
  status: ServerStatus
  connection_ip: string | null
  connection_port: number
  connection_domain: string | null
  ram: number
  cpu: number
  disk: number
  modpack: string | null
  suspend_reason: string | null
  next_billing_date: string | null
  created_at: string
  updated_at: string
  // Joined relations (optional)
  plans?: Plan
  nodes?: Node
}

export interface Node {
  id: string
  name: string
  location_country: string
  location_city: string
  location_region: string
  location_flag: string
  pterodactyl_node_id: number
  status: string
  ip: string
  fqdn: string | null
  total_ram: number
  used_ram: number
  total_disk: number
  used_disk: number
  total_cpu: number
  used_cpu: number
  latency: number
  is_default: boolean
  created_at: string
}

export interface Ticket {
  id: string
  ticket_id: string
  user_id: string
  subject: string
  priority: string
  status: TicketStatus
  category: string
  assigned_to: string | null
  closed_at: string | null
  created_at: string
  updated_at: string
  // Joined
  profiles?: Profile
}

export interface TicketMessage {
  id: string
  ticket_id: string
  sender_id: string
  sender_role: 'user' | 'admin'
  content: string
  created_at: string
  // Joined
  profiles?: Profile
}

export interface Payment {
  id: string
  user_id: string
  server_id: string | null
  plan_id: string | null
  razorpay_order_id: string | null
  razorpay_payment_id: string | null
  amount: number
  currency: string
  status: PaymentStatus
  description: string | null
  invoice_id: string | null
  period_start: string | null
  period_end: string | null
  created_at: string
  // Joined
  plans?: Plan
  profiles?: Profile
}

export interface Bot {
  id: string
  user_id: string
  pterodactyl_server_id: string | null
  name: string
  runtime: string
  start_command: string
  status: string
  plan_id: string | null
  ram: number
  cpu: number
  disk: number
  auto_restart: boolean
  created_at: string
}

// ── createClient — safe for client components ─────────────────
// Guards against missing env vars during static prerendering.
function createStubClient(): any {
  const chain = (): any => new Proxy({}, {
    get: (_t, prop) => {
      if (prop === 'then') return undefined // not a Promise
      return (..._args: any[]) => chain()
    }
  })
  return {
    from: () => ({
      select: chain, insert: chain, update: chain, delete: chain, upsert: chain,
      eq: chain, neq: chain, in: chain, gte: chain, order: chain, limit: chain,
      single: () => Promise.resolve({ data: null, error: null }),
      maybeSingle: () => Promise.resolve({ data: null, error: null }),
      then: (fn: any) => Promise.resolve({ data: [], error: null }).then(fn),
    }),
    auth: {
      getSession: async () => ({ data: { session: null } }),
      getUser: async () => ({ data: { user: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
      signUp: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
      signOut: async () => {},
    },
    channel: () => ({ on: () => ({ subscribe: () => ({}) }) }),
    removeChannel: () => {},
  }
}

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return createStubClient()
  return createBrowserClient(url, key)
}
