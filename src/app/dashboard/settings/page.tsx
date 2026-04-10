'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import DashboardHeader from '@/components/layout/DashboardHeader'
import { Save, Check, Eye, EyeOff, AlertTriangle } from 'lucide-react'

export default function SettingsPage() {
  const [tab, setTab] = useState<'profile' | 'security' | 'notifications'>('profile')
  const [saved, setSaved] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [profile, setProfile] = useState({ username: 'Steve_Builder', email: 'steve@example.com' })
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' })
  const [notifications, setNotifications] = useState({
    serverOnline: true,
    serverOffline: true,
    ticketReply: true,
    paymentSuccess: true,
    maintenanceAlerts: false,
  })

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      <DashboardHeader title="Account Settings" />
      <div className="p-6 max-w-2xl">

        {/* Tabs */}
        <div className="flex border-b border-mc-card-border mb-6">
          {[
            { id: 'profile', label: 'Profile' },
            { id: 'security', label: 'Security' },
            { id: 'notifications', label: 'Notifications' },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setTab(id as any)}
              className={`px-5 py-3 text-sm font-body uppercase tracking-wider transition-all border-b-2 -mb-px ${
                tab === id ? 'text-mc-diamond border-mc-diamond' : 'text-gray-500 border-transparent hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>

          {/* Profile Tab */}
          {tab === 'profile' && (
            <div className="flex flex-col gap-5">
              {/* Avatar */}
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-mc-grass border-4 border-mc-grass-dark flex items-center justify-center text-2xl font-minecraft text-white pixel-art">
                  S
                </div>
                <div>
                  <p className="text-white font-body font-semibold">{profile.username}</p>
                  <p className="text-gray-500 text-sm font-mono">{profile.email}</p>
                  <button className="text-mc-diamond text-xs font-mono hover:underline mt-1">Change avatar</button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 uppercase tracking-wider mb-2">Username</label>
                <input
                  type="text"
                  value={profile.username}
                  onChange={e => setProfile(p => ({ ...p, username: e.target.value }))}
                  className="mc-input w-full"
                />
                <p className="text-gray-600 text-xs font-mono mt-1">You can change your username once every 30 days.</p>
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                  className="mc-input w-full"
                />
              </div>

              <button onClick={handleSave} className={`flex items-center gap-2 px-6 py-3 text-sm font-body uppercase w-fit transition-all ${saved ? 'bg-mc-emerald border-2 border-green-700 text-white' : 'mc-btn'}`}>
                {saved ? <><Check size={14} /> Saved!</> : <><Save size={14} /> Save Profile</>}
              </button>

              {/* Danger zone */}
              <div className="mt-6 mc-card p-5 border border-mc-redstone/20">
                <h3 className="text-mc-redstone font-body font-semibold mb-2 flex items-center gap-2">
                  <AlertTriangle size={14} /> Danger Zone
                </h3>
                <p className="text-gray-500 text-sm font-body mb-4">
                  Deleting your account will permanently remove all servers, data, and billing history. This cannot be undone.
                </p>
                <button className="border border-mc-redstone/40 text-mc-redstone hover:bg-mc-redstone/10 px-4 py-2 text-xs font-body uppercase transition-all">
                  Delete Account
                </button>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {tab === 'security' && (
            <div className="flex flex-col gap-5">
              <div className="mc-card p-4 border border-mc-diamond/20 text-mc-diamond text-xs font-mono">
                🔐 Use a strong, unique password. Enable 2FA for extra security.
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 uppercase tracking-wider mb-2">Current Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwords.current}
                    onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))}
                    placeholder="Current password"
                    className="mc-input w-full pr-10"
                  />
                  <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-mc-diamond">
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 uppercase tracking-wider mb-2">New Password</label>
                <input
                  type="password"
                  value={passwords.new}
                  onChange={e => setPasswords(p => ({ ...p, new: e.target.value }))}
                  placeholder="Min 8 characters"
                  className="mc-input w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 uppercase tracking-wider mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={passwords.confirm}
                  onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                  placeholder="Repeat new password"
                  className={`mc-input w-full ${passwords.confirm && passwords.new !== passwords.confirm ? 'border-mc-redstone' : ''}`}
                />
              </div>

              <button onClick={handleSave} disabled={!passwords.current || passwords.new !== passwords.confirm} className="mc-btn px-6 py-3 text-sm w-fit disabled:opacity-50">
                Update Password
              </button>

              <div className="mt-4">
                <h3 className="text-white font-body font-semibold mb-2">Two-Factor Authentication</h3>
                <p className="text-gray-500 text-sm font-body mb-3">Protect your account with an authenticator app.</p>
                <button className="border border-mc-grass/40 text-mc-grass hover:bg-mc-grass/10 px-4 py-2 text-xs font-body uppercase transition-all">
                  Enable 2FA
                </button>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {tab === 'notifications' && (
            <div className="flex flex-col gap-3">
              {[
                { k: 'serverOnline', label: 'Server comes online', desc: 'Email when your server finishes starting' },
                { k: 'serverOffline', label: 'Server goes offline', desc: 'Email when your server stops unexpectedly' },
                { k: 'ticketReply', label: 'Support ticket replies', desc: 'Email when staff reply to your tickets' },
                { k: 'paymentSuccess', label: 'Payment confirmations', desc: 'Email receipt for every payment' },
                { k: 'maintenanceAlerts', label: 'Maintenance alerts', desc: 'Email before scheduled maintenance' },
              ].map(({ k, label, desc }) => (
                <div key={k} className="flex items-center justify-between mc-card p-4 border border-mc-card-border">
                  <div>
                    <p className="text-white text-sm font-body font-medium">{label}</p>
                    <p className="text-gray-500 text-xs font-mono">{desc}</p>
                  </div>
                  <button
                    onClick={() => setNotifications(p => ({ ...p, [k]: !p[k as keyof typeof notifications] }))}
                    className={`w-12 h-6 border-2 relative transition-all ${
                      notifications[k as keyof typeof notifications]
                        ? 'bg-mc-grass border-mc-grass-dark'
                        : 'bg-mc-dark-bg border-mc-card-border'
                    }`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white pixel-art transition-all ${
                      notifications[k as keyof typeof notifications] ? 'left-6' : 'left-0.5'
                    }`} />
                  </button>
                </div>
              ))}
              <button onClick={handleSave} className={`flex items-center gap-2 px-6 py-3 text-sm font-body uppercase w-fit mt-2 transition-all ${saved ? 'bg-mc-emerald border-2 border-green-700 text-white' : 'mc-btn'}`}>
                {saved ? <><Check size={14} /> Saved!</> : <><Save size={14} /> Save Preferences</>}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
