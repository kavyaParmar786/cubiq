'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { CheckCircle, AlertTriangle, XCircle, RefreshCw } from 'lucide-react'

const services = [
  { name: 'Minecraft Node — Mumbai (IN)', status: 'operational', latency: '4ms', uptime: '99.98%' },
  { name: 'Minecraft Node — Delhi (IN)', status: 'operational', latency: '6ms', uptime: '99.97%' },
  { name: 'Minecraft Node — US East', status: 'operational', latency: '12ms', uptime: '99.99%' },
  { name: 'Minecraft Node — EU West', status: 'degraded', latency: '28ms', uptime: '99.84%' },
  { name: 'Minecraft Node — Singapore', status: 'operational', latency: '9ms', uptime: '99.96%' },
  { name: 'Bot Hosting Node — Mumbai', status: 'operational', latency: '3ms', uptime: '99.99%' },
  { name: 'Control Panel (Pterodactyl)', status: 'operational', latency: '45ms', uptime: '99.99%' },
  { name: 'Billing & Payments', status: 'operational', latency: '120ms', uptime: '100%' },
  { name: 'Email Delivery', status: 'operational', latency: '—', uptime: '99.95%' },
  { name: 'API Gateway', status: 'operational', latency: '18ms', uptime: '99.99%' },
  { name: 'DDoS Protection Layer', status: 'operational', latency: '—', uptime: '100%' },
  { name: 'Database Cluster', status: 'operational', latency: '2ms', uptime: '100%' },
]

const incidents = [
  {
    date: '2024-06-12',
    title: 'EU West Node — Elevated Latency',
    status: 'monitoring',
    description: 'We are investigating elevated latency on our EU West node. Minecraft servers are still online but players may experience higher ping than usual. Our team is actively working on resolving this.',
  },
  {
    date: '2024-06-08',
    title: 'Scheduled Maintenance — Mumbai Node',
    status: 'resolved',
    description: 'Planned hardware upgrade completed successfully. All servers resumed within the maintenance window. No data loss occurred.',
  },
]

function StatusIcon({ status }: { status: string }) {
  if (status === 'operational') return <CheckCircle size={16} className="text-mc-emerald" />
  if (status === 'degraded') return <AlertTriangle size={16} className="text-mc-gold" />
  return <XCircle size={16} className="text-mc-redstone" />
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    operational: 'text-mc-emerald border-green-800 bg-green-950/30',
    degraded: 'text-mc-gold border-yellow-800 bg-yellow-950/30',
    outage: 'text-mc-redstone border-red-800 bg-red-950/30',
    monitoring: 'text-mc-gold border-yellow-800 bg-yellow-950/30',
    resolved: 'text-mc-emerald border-green-800 bg-green-950/30',
  }
  return (
    <span className={`mc-badge text-xs uppercase ${styles[status] || styles.operational}`}>
      {status}
    </span>
  )
}

export default function StatusPage() {
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [refreshing, setRefreshing] = useState(false)

  const overallStatus = services.some(s => s.status === 'outage')
    ? 'outage'
    : services.some(s => s.status === 'degraded')
    ? 'degraded'
    : 'operational'

  const refresh = () => {
    setRefreshing(true)
    setTimeout(() => {
      setLastUpdated(new Date())
      setRefreshing(false)
    }, 1000)
  }

  useEffect(() => {
    const interval = setInterval(() => setLastUpdated(new Date()), 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-mc-dark-bg">
      <Navbar />
      <main className="pt-24 pb-24">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-white mb-4" style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '1.4rem', lineHeight: '2rem' }}>
              SYSTEM STATUS
            </h1>

            {/* Overall status banner */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`inline-flex items-center gap-3 px-8 py-4 border-2 mt-4 ${
                overallStatus === 'operational'
                  ? 'border-mc-emerald/30 bg-green-950/20'
                  : overallStatus === 'degraded'
                  ? 'border-mc-gold/30 bg-yellow-950/20'
                  : 'border-mc-redstone/30 bg-red-950/20'
              }`}
            >
              <div className={`w-3 h-3 rounded-full ${
                overallStatus === 'operational' ? 'bg-mc-emerald animate-pulse' :
                overallStatus === 'degraded' ? 'bg-mc-gold animate-pulse' :
                'bg-mc-redstone animate-pulse'
              }`} style={{ boxShadow: overallStatus === 'operational' ? '0 0 8px #00FF5A' : '0 0 8px #FFD700' }} />
              <span className={`font-body font-semibold text-lg ${
                overallStatus === 'operational' ? 'text-mc-emerald' :
                overallStatus === 'degraded' ? 'text-mc-gold' :
                'text-mc-redstone'
              }`}>
                {overallStatus === 'operational' ? 'All Systems Operational' :
                 overallStatus === 'degraded' ? 'Partial Degradation Detected' :
                 'Service Disruption'}
              </span>
            </motion.div>

            {/* Last updated */}
            <div className="flex items-center justify-center gap-3 mt-4 text-gray-600 text-xs font-mono">
              <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
              <button onClick={refresh} className="hover:text-mc-diamond transition-colors flex items-center gap-1">
                <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
          </div>

          {/* Services List */}
          <div className="mc-card border border-mc-card-border mb-8">
            <div className="px-6 py-4 border-b border-mc-card-border">
              <h2 className="text-white font-body font-semibold uppercase tracking-wider text-sm">Services</h2>
            </div>
            <div className="divide-y divide-mc-card-border">
              {services.map((service, i) => (
                <motion.div
                  key={service.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center justify-between px-6 py-4 hover:bg-mc-hover-bg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <StatusIcon status={service.status} />
                    <span className="text-sm font-body text-gray-300">{service.name}</span>
                  </div>
                  <div className="flex items-center gap-6 text-xs font-mono text-gray-500">
                    <span>{service.latency}</span>
                    <span className="text-mc-emerald">{service.uptime}</span>
                    <StatusBadge status={service.status} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Incidents */}
          <h2 className="text-white font-body font-semibold uppercase tracking-wider text-sm mb-4">
            Recent Incidents
          </h2>
          <div className="space-y-4">
            {incidents.map((incident, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="mc-card p-6 border border-mc-card-border"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <span className="text-gray-500 text-xs font-mono">{incident.date}</span>
                    <h3 className="text-white font-body font-semibold mt-1">{incident.title}</h3>
                  </div>
                  <StatusBadge status={incident.status} />
                </div>
                <p className="text-gray-400 text-sm font-body leading-relaxed">{incident.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Uptime History */}
          <div className="mt-10 mc-card p-6 border border-mc-card-border text-center">
            <p className="text-gray-500 text-sm font-mono">
              90-day uptime average across all services:{' '}
              <span className="text-mc-emerald font-bold">99.97%</span>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
