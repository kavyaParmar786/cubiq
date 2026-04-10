'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authApi, setToken, clearToken } from '@/lib/api'

interface User {
  id: string
  username: string
  email: string
  role: 'user' | 'admin'
  status: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Load user on mount
  useEffect(() => {
    const stored = localStorage.getItem('cubiq_user')
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {}
    }

    // Verify token is still valid
    authApi.me()
      .then(data => {
        setUser(data.user)
        localStorage.setItem('cubiq_user', JSON.stringify(data.user))
      })
      .catch(() => {
        clearToken()
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (email: string, password: string) => {
    const data = await authApi.login({ email, password })
    setToken(data.token)
    setUser(data.user)
    localStorage.setItem('cubiq_user', JSON.stringify(data.user))
  }

  const register = async (username: string, email: string, password: string) => {
    const data = await authApi.register({ username, email, password })
    setToken(data.token)
    setUser(data.user)
    localStorage.setItem('cubiq_user', JSON.stringify(data.user))
  }

  const logout = () => {
    clearToken()
    setUser(null)
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      isAdmin: user?.role === 'admin',
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
