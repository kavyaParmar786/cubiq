'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { createAdminClient } from '@/lib/supabase'

// Re-export admin client for use in admin pages
export { createAdminClient }

// Hook that redirects non-admins away
export function useAdminGuard() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.replace('/dashboard')
    }
  }, [user, loading])

  return { user, loading, isAdmin: user?.role === 'admin' }
}
