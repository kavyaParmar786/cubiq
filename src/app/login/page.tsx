'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Eye, EyeOff, LogIn, Zap } from 'lucide-react'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // TODO: connect to /api/auth/login
    setTimeout(() => {
      setLoading(false)
      window.location.href = '/dashboard'
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-mc-dark-bg flex items-center justify-center px-4 relative">
      {/* Background */}
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="absolute inset-0 bg-hero-gradient" />

      {/* Floating blocks */}
      {[
        { size: 'w-8 h-8', color: 'bg-mc-grass border-mc-grass-dark', top: '10%', left: '5%', delay: 0 },
        { size: 'w-6 h-6', color: 'bg-mc-diamond border-teal-600', top: '20%', right: '8%', delay: 0.5 },
        { size: 'w-5 h-5', color: 'bg-mc-gold border-yellow-600', bottom: '25%', left: '8%', delay: 1 },
        { size: 'w-7 h-7', color: 'bg-mc-redstone border-red-700', bottom: '15%', right: '6%', delay: 0.8 },
      ].map((b, i) => (
        <motion.div
          key={i}
          className={`absolute ${b.size} ${b.color} border-2 pixel-art opacity-20`}
          style={{ top: b.top, bottom: b.bottom, left: b.left, right: b.right }}
          animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3 + i, delay: b.delay, repeat: Infinity }}
        />
      ))}

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-8 h-8 relative pixel-art">
              <div className="absolute inset-0 bg-mc-grass border-2 border-mc-grass-dark" />
              <div className="absolute bottom-0 left-0 right-0 h-5 bg-mc-dirt border-t-2 border-mc-grass-dark" />
            </div>
            <span className="text-white text-sm" style={{ fontFamily: "'Press Start 2P', monospace" }}>
              CUBIQ <span className="text-mc-diamond">HOST</span>
            </span>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mc-card p-8 border border-mc-card-border"
        >
          <h1 className="text-white font-body font-bold text-xl mb-1 text-center">Welcome back</h1>
          <p className="text-gray-500 text-sm text-center font-body mb-8">Sign in to your Cubiq account</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-mono text-gray-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="steve@example.com"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="mc-input"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  className="mc-input pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-mc-diamond transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="flex justify-end mt-2">
                <Link href="/forgot-password" className="text-xs text-mc-diamond hover:underline font-mono">
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mc-btn w-full flex items-center justify-center gap-2 py-3"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm font-body text-gray-500">
            Don't have an account?{' '}
            <Link href="/register" className="text-mc-diamond hover:underline">
              Create one free
            </Link>
          </div>
        </motion.div>

        {/* Bottom note */}
        <p className="text-center text-xs text-gray-600 font-mono mt-6">
          Protected by enterprise-grade security
        </p>
      </div>
    </div>
  )
}
