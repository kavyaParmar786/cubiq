'use client'

// Admin guard — client components only
// createAdminClient lives in supabase-server.ts (never imported here)

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

// Hook: redirects non-admin users away from admin pages
export function useAdminGuard() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.replace('/dashboard')
    }
  }, [user, loading, router])

  return {
    user,
    loading,
    isAdmin: user?.role === 'admin',
  }
}
