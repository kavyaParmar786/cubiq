'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, UserPlus, Check } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' })
  const [agreed, setAgreed] = useState(false)
  const { register } = useAuth()
  const router = useRouter()

  const passwordStrength = () => {
    const p = form.password
    if (!p) return 0
    let score = 0
    if (p.length >= 8) score++
    if (/[A-Z]/.test(p)) score++
    if (/[0-9]/.test(p)) score++
    if (/[^A-Za-z0-9]/.test(p)) score++
    return score
  }

  const strength = passwordStrength()
  const strengthColor = ['', 'bg-mc-redstone', 'bg-mc-gold', 'bg-mc-emerald', 'bg-mc-diamond'][strength]
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return }
    setError('')
    setLoading(true)
    try {
      await register(form.username, form.email, form.password)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-mc-dark-bg flex items-center justify-center px-4 py-12 relative">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="absolute inset-0 bg-hero-gradient" />

      <div className="relative z-10 w-full max-w-md">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
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

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="mc-card p-8 border border-mc-card-border">
          <h1 className="text-white font-body font-bold text-xl mb-1 text-center">Create your account</h1>
          <p className="text-gray-500 text-sm text-center font-body mb-8">Start hosting in 60 seconds</p>

          {error && (
            <div className="mb-4 px-4 py-3 border border-mc-redstone/40 bg-mc-redstone/10 text-mc-redstone text-sm font-body">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-gray-400 uppercase tracking-wider mb-2">Username</label>
              <input type="text" required minLength={3} maxLength={20} placeholder="Steve_Miner"
                value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                pattern="[a-zA-Z0-9_-]+" title="Letters, numbers, underscores and hyphens only"
                className="mc-input" />
            </div>
            <div>
              <label className="block text-xs font-mono text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
              <input type="email" required placeholder="you@example.com"
                value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="mc-input" />
            </div>
            <div>
              <label className="block text-xs font-mono text-gray-400 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} required minLength={8} placeholder="Min 8 characters"
                  value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  className="mc-input pr-12" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-mc-diamond transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className={`h-1 flex-1 transition-all duration-300 ${i <= strength ? strengthColor : 'bg-mc-card-border'}`} />
                    ))}
                  </div>
                  <span className={`text-xs font-mono mt-1 block ${['', 'text-mc-redstone', 'text-mc-gold', 'text-mc-emerald', 'text-mc-diamond'][strength]}`}>
                    {strengthLabel}
                  </span>
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-mono text-gray-400 uppercase tracking-wider mb-2">Confirm Password</label>
              <input type="password" required placeholder="Repeat password"
                value={form.confirmPassword} onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
                className={`mc-input ${form.confirmPassword && form.password !== form.confirmPassword ? 'border-mc-redstone' : ''}`} />
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <p className="text-mc-redstone text-xs font-mono mt-1">Passwords do not match</p>
              )}
            </div>
            <label className="flex items-start gap-3 cursor-pointer mt-2">
              <button type="button" onClick={() => setAgreed(!agreed)}
                className={`w-5 h-5 border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${agreed ? 'bg-mc-grass border-mc-grass-dark' : 'border-mc-card-border bg-mc-dark-bg'}`}>
                {agreed && <Check size={12} />}
              </button>
              <span className="text-gray-400 text-xs font-body leading-relaxed">
                I agree to the <Link href="/terms" className="text-mc-diamond hover:underline">Terms of Service</Link> and{' '}
                <Link href="/privacy" className="text-mc-diamond hover:underline">Privacy Policy</Link>
              </span>
            </label>
            <button type="submit"
              disabled={loading || !agreed || form.password !== form.confirmPassword}
              className="mc-btn w-full flex items-center justify-center gap-2 py-3 mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin" /> Creating account...</>
              ) : (
                <><UserPlus size={16} /> Create Account — Free</>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm font-body text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="text-mc-diamond hover:underline">Sign in</Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
