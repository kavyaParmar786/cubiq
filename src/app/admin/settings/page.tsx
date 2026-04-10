'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import DashboardHeader from '@/components/layout/DashboardHeader'
import { Save, Eye, EyeOff, RefreshCw, Check } from 'lucide-react'

type Section = 'pterodactyl' | 'email' | 'payment' | 'general'

export default function AdminSettingsPage() {
  const [activeSection, setActiveSection] = useState<Section>('pterodactyl')
  const [saved, setSaved] = useState(false)
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})

  const [settings, setSettings] = useState({
    pterodactylUrl: 'https://panel.example.com',
    pterodactylApiKey: 'ptla_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    emailHost: 'smtp.gmail.com',
    emailPort: '587',
    emailUser: 'noreply@cubiqhost.com',
    emailPass: '••••••••••••',
    emailFrom: 'Cubiq Host <noreply@cubiqhost.com>',
    razorpayKeyId: 'rzp_live_xxxxxxxxxx',
    razorpaySecret: '••••••••••••••••••••',
    siteName: 'Cubiq Host',
    siteUrl: 'https://cubiqhost.com',
    maintenanceMode: false,
    registrationOpen: true,
    maxServersPerUser: '10',
    defaultNode: 'mumbai-in-1',
  })

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const toggle = (key: string) => setShowSecrets(p => ({ ...p, [key]: !p[key] }))

  const Field = ({ label, k, type = 'text', placeholder = '' }: { label: string; k: keyof typeof settings; type?: string; placeholder?: string }) => (
    <div>
      <label className="block text-xs font-mono text-gray-400 uppercase tracking-wider mb-2">{label}</label>
      <div className="relative">
        <input
          type={type === 'secret' ? (showSecrets[k] ? 'text' : 'password') : type}
          value={String(settings[k])}
          onChange={e => setSettings(p => ({ ...p, [k]: e.target.value }))}
          placeholder={placeholder}
          className="mc-input w-full pr-10"
        />
        {type === 'secret' && (
          <button
            type="button"
            onClick={() => toggle(k)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-mc-diamond"
          >
            {showSecrets[k] ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        )}
      </div>
    </div>
  )

  const sections = [
    { id: 'pterodactyl', label: '🦕 Pterodactyl API' },
    { id: 'email', label: '📧 Email (SMTP)' },
    { id: 'payment', label: '💳 Razorpay' },
    { id: 'general', label: '⚙️ General' },
  ]

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      <DashboardHeader title="Settings" />
      <div className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Section nav */}
          <div className="lg:w-48 flex lg:flex-col gap-2 flex-wrap">
            {sections.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id as Section)}
                className={`px-4 py-3 text-sm font-body text-left border transition-all whitespace-nowrap ${
                  activeSection === s.id
                    ? 'border-mc-diamond text-mc-diamond bg-mc-diamond/5'
                    : 'border-mc-card-border text-gray-400 hover:text-white'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Settings form */}
          <div className="flex-1 max-w-xl">
            <motion.div key={activeSection} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-5">

              {activeSection === 'pterodactyl' && (
                <>
                  <div className="mc-card p-4 border border-mc-gold/20 bg-mc-gold/5 text-mc-gold text-xs font-mono">
                    ⚠️ Changes to Pterodactyl settings will affect all server deployments. Test before saving.
                  </div>
                  <Field label="Pterodactyl Panel URL" k="pterodactylUrl" placeholder="https://panel.yourdomain.com" />
                  <Field label="Application API Key" k="pterodactylApiKey" type="secret" />
                  <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 border border-mc-diamond/40 text-mc-diamond hover:bg-mc-diamond/10 text-xs font-body uppercase transition-all">
                      <RefreshCw size={12} /> Test Connection
                    </button>
                  </div>
                </>
              )}

              {activeSection === 'email' && (
                <>
                  <Field label="SMTP Host" k="emailHost" placeholder="smtp.gmail.com" />
                  <Field label="SMTP Port" k="emailPort" type="number" />
                  <Field label="Email Username" k="emailUser" />
                  <Field label="Email Password" k="emailPass" type="secret" />
                  <Field label="From Address" k="emailFrom" placeholder="Name <email@domain.com>" />
                  <button className="flex items-center gap-2 px-4 py-2 border border-mc-diamond/40 text-mc-diamond hover:bg-mc-diamond/10 text-xs font-body uppercase transition-all w-fit">
                    <RefreshCw size={12} /> Send Test Email
                  </button>
                </>
              )}

              {activeSection === 'payment' && (
                <>
                  <div className="mc-card p-4 border border-mc-grass/20 text-mc-grass text-xs font-mono">
                    💡 Use test keys for development. Switch to live keys for production.
                  </div>
                  <Field label="Razorpay Key ID" k="razorpayKeyId" />
                  <Field label="Razorpay Secret Key" k="razorpaySecret" type="secret" />
                </>
              )}

              {activeSection === 'general' && (
                <>
                  <Field label="Site Name" k="siteName" />
                  <Field label="Site URL" k="siteUrl" />
                  <Field label="Max Servers Per User" k="maxServersPerUser" type="number" />
                  <Field label="Default Node ID" k="defaultNode" />

                  <div className="flex flex-col gap-3">
                    {[
                      { label: 'Maintenance Mode', desc: 'Only admins can access the panel', k: 'maintenanceMode' },
                      { label: 'Registration Open', desc: 'Allow new user registrations', k: 'registrationOpen' },
                    ].map(({ label, desc, k }) => (
                      <div key={k} className="flex items-center justify-between mc-card p-4 border border-mc-card-border">
                        <div>
                          <p className="text-white text-sm font-body font-medium">{label}</p>
                          <p className="text-gray-500 text-xs font-mono">{desc}</p>
                        </div>
                        <button
                          onClick={() => setSettings(p => ({ ...p, [k]: !p[k as keyof typeof settings] }))}
                          className={`w-12 h-6 border-2 relative transition-all ${
                            settings[k as keyof typeof settings]
                              ? 'bg-mc-grass border-mc-grass-dark'
                              : 'bg-mc-dark-bg border-mc-card-border'
                          }`}
                        >
                          <div className={`absolute top-0.5 w-4 h-4 bg-white pixel-art transition-all ${
                            settings[k as keyof typeof settings] ? 'left-6' : 'left-0.5'
                          }`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <button
                onClick={handleSave}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-body uppercase tracking-wider transition-all w-fit ${
                  saved ? 'bg-mc-emerald border-2 border-green-700 text-white' : 'mc-btn'
                }`}
              >
                {saved ? <><Check size={14} /> Saved!</> : <><Save size={14} /> Save Settings</>}
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
