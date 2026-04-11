'use client'

// MODIFIED: Now uses Supabase Auth instead of mock JWT
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClient, type Profile } from '@/lib/supabase'
import type { Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: Profile | null
  session: Session | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isAdmin: boolean
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    return data as Profile | null
  }

  const refreshProfile = async () => {
    if (!session?.user) return
    const profile = await fetchProfile(session.user.id)
    if (profile) setUser(profile)
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        const profile = await fetchProfile(session.user.id)
        setUser(profile)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        if (session?.user) {
          const profile = await fetchProfile(session.user.id)
          setUser(profile)
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
  }

  const register = async (username: string, email: string, password: string) => {
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .maybeSingle()

    if (existing) throw new Error('Username is already taken.')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    })
    if (error) throw new Error(error.message)

    // Create Pterodactyl user account (non-blocking)
    if (data.user) {
      fetch('/api/auth/create-pterodactyl-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: data.user.id, email, username }),
      }).catch(console.warn)
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{
      user, session, loading, login, register, logout,
      isAdmin: user?.role === 'admin',
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
