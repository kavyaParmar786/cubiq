import { createBrowserClient } from '@supabase/ssr'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Types matching our schema
export type UserRole = 'user' | 'admin'
export type ServerStatus = 'installing' | 'online' | 'offline' | 'starting' | 'stopping' | 'suspended' | 'deleted'
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
  plan_id: string
  node_id: string
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
  created_at: string
  plan?: Plan
  node?: Node
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
  is_default: boolean
}

export interface Ticket {
  id: string
  ticket_id: string
  user_id: string
  subject: string
  priority: string
  status: TicketStatus
  category: string
  created_at: string
  updated_at: string
  profiles?: Profile
}

export interface TicketMessage {
  id: string
  ticket_id: string
  sender_id: string
  sender_role: string
  content: string
  created_at: string
  profiles?: Profile
}

export interface Payment {
  id: string
  user_id: string
  server_id: string | null
  plan_id: string | null
  amount: number
  status: PaymentStatus
  description: string | null
  invoice_id: string | null
  created_at: string
  plans?: Plan
}

export interface Bot {
  id: string
  user_id: string
  name: string
  runtime: string
  start_command: string
  status: string
  ram: number
  cpu: number
  disk: number
  auto_restart: boolean
  created_at: string
}

// ── Browser client (use in client components) ─────────────────
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// ── Server client (use in server components / API routes) ─────
export function createServerSupabaseClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}

// ── Admin client (bypasses RLS — server only!) ────────────────
export function createAdminClient() {
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js')
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
