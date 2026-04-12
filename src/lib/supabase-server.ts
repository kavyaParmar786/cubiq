// ── Server-only Supabase clients ──────────────────────────────
// Import this ONLY in:
//   - src/app/api/**/route.ts
//   - src/middleware.ts
//   - Server Components (page.tsx with no 'use client')
//
// NEVER import this in client components ('use client' files).

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// ── Session-aware server client (reads auth cookies) ──────────
// Use this in API routes that need to check who the user is.
export function createServerSupabaseClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as any)
            )
          } catch {
            // setAll called from a Server Component — ignore
          }
        },
      },
    }
  )
}

// ── Admin client (bypasses RLS — server only!) ────────────────
// Use this when you need to read/write rows regardless of RLS,
// e.g. creating a server record on behalf of any user.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
