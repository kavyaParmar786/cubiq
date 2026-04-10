'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DashboardHeader from '@/components/layout/DashboardHeader'
import { Globe, Plus, Edit2, Trash2, Save, X, Cpu, HardDrive, Server } from 'lucide-react'

interface Node {
  id: string
  name: string
  location: string
  flag: string
  host: string
  port: number
  totalRam: string
  usedRam: string
  totalCpu: number
  usedCpu: number
  servers: number
  status: 'online' | 'offline' | 'maintenance'
  fqdn: string
}

const initialNodes: Node[] = [
  { id: 'n1', name: 'Mumbai-01', location: 'Mumbai, India', flag: '🇮🇳', host: '103.x.x.1', port: 8080, totalRam: '256GB', usedRam: '148GB', totalCpu: 64, usedCpu: 38, servers: 412, status: 'online', fqdn: 'node1.in.cubiqhost.com' },
  { id: 'n2', name: 'Delhi-01', location: 'Delhi, India', flag: '🇮🇳', host: '103.x.x.2', port: 8080, totalRam: '128GB', usedRam: '89GB', totalCpu: 32, usedCpu: 21, servers: 218, status: 'online', fqdn: 'node2.in.cubiqhost.com' },
  { id: 'n3', name: 'US-East-01', location: 'New York, USA', flag: '🇺🇸', host: '142.x.x.3', port: 8080, totalRam: '256GB', usedRam: '201GB', totalCpu: 64, usedCpu: 52, servers: 534, status: 'online', fqdn: 'node1.us.cubiqhost.com' },
  { id: 'n4', name: 'EU-West-01', location: 'Frankfurt, Germany', flag: '🇩🇪', host: '95.x.x.4', port: 8080, totalRam: '128GB', usedRam: '71GB', totalCpu: 32, usedCpu: 24, servers: 189, status: 'maintenance', fqdn: 'node1.eu.cubiqhost.com' },
  { id: 'n5', name: 'SG-01', location: 'Singapore', flag: '🇸🇬', host: '178.x.x.5', port: 8080, totalRam: '64GB', usedRam: '38GB', totalCpu: 16, usedCpu: 9, servers: 98, status: 'online', fqdn: 'node1.sg.cubiqhost.com' },
]

const statusStyles: Record<string, string> = {
  online: 'text-mc-emerald border-green-800',
  offline: 'text-mc-redstone border-red-800',
  maintenance: 'text-mc-gold border-yellow-800',
}

export default function AdminNodesPage() {
  const [nodes, setNodes] = useState(initialNodes)
  const [showCreate, setShowCreate] = useState(false)
  const [newNode, setNewNode] = useState({ name: '', location: '', flag: '🌍', host: '', port: 8080, fqdn: '', totalRam: '', totalCpu: 0 })

  const createNode = () => {
    const node: Node = {
      id: `n${Date.now()}`,
      ...newNode,
      usedRam: '0GB',
      usedCpu: 0,
      servers: 0,
      status: 'online',
    }
    setNodes(prev => [...prev, node])
    setShowCreate(false)
    setNewNode({ name: '', location: '', flag: '🌍', host: '', port: 8080, fqdn: '', totalRam: '', totalCpu: 0 })
  }

  const deleteNode = (id: string) => setNodes(prev => prev.filter(n => n.id !== id))

  const toggleMaintenance = (id: string) => {
    setNodes(prev => prev.map(n => n.id === id
      ? { ...n, status: n.status === 'maintenance' ? 'online' : 'maintenance' }
      : n
    ))
  }

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      <DashboardHeader title="Node Locations" />
      <div className="p-6">

        {/* Info banner */}
        <div className="mc-card p-4 mb-6 border border-mc-diamond/20 bg-mc-diamond/5 flex items-start gap-3">
          <Globe size={16} className="text-mc-diamond mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-mc-diamond text-sm font-body font-semibold">Admin-Only Node Assignment</p>
            <p className="text-gray-400 text-xs font-body mt-0.5">
              Nodes are assigned by admins only. Users cannot select their node location. This ensures optimal load balancing across infrastructure.
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-end mb-6">
          <button onClick={() => setShowCreate(!showCreate)} className="mc-btn flex items-center gap-2 text-xs px-4 py-2">
            <Plus size={14} /> Add Node
          </button>
        </div>

        {/* Create form */}
        <AnimatePresence>
          {showCreate && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mc-card p-6 mb-6 border border-mc-grass/20"
            >
              <h3 className="text-white font-body font-bold mb-4">Add New Node</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {[
                  { label: 'Node Name', key: 'name', placeholder: 'Mumbai-02' },
                  { label: 'Location', key: 'location', placeholder: 'Mumbai, India' },
                  { label: 'Flag Emoji', key: 'flag', placeholder: '🇮🇳' },
                  { label: 'Host IP', key: 'host', placeholder: '103.x.x.1' },
                  { label: 'Port', key: 'port', placeholder: '8080', type: 'number' },
                  { label: 'FQDN', key: 'fqdn', placeholder: 'node.cubiqhost.com' },
                  { label: 'Total RAM', key: 'totalRam', placeholder: '128GB' },
                  { label: 'CPU Cores', key: 'totalCpu', placeholder: '32', type: 'number' },
                ].map(({ label, key, placeholder, type }) => (
                  <div key={key}>
                    <label className="block text-xs font-mono text-gray-400 uppercase mb-1">{label}</label>
                    <input
                      type={type || 'text'}
                      placeholder={placeholder}
                      value={(newNode as any)[key]}
                      onChange={e => setNewNode(p => ({ ...p, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
                      className="mc-input text-sm py-2"
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={createNode} className="mc-btn px-6 py-2 text-sm flex items-center gap-2">
                  <Save size={14} /> Add Node
                </button>
                <button onClick={() => setShowCreate(false)} className="border border-mc-card-border text-gray-400 px-4 py-2 text-sm hover:text-white transition-colors flex items-center gap-1">
                  <X size={14} /> Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nodes Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {nodes.map((node, i) => {
            const ramPct = Math.round((parseInt(node.usedRam) / parseInt(node.totalRam)) * 100) || 0
            const cpuPct = Math.round((node.usedCpu / node.totalCpu) * 100)

            return (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="mc-card p-6 border border-mc-card-border"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{node.flag}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-body font-bold">{node.name}</h3>
                        <span className={`mc-badge text-xs ${statusStyles[node.status]}`}>{node.status}</span>
                      </div>
                      <p className="text-gray-500 text-xs font-mono">{node.location}</p>
                      <p className="text-gray-600 text-xs font-mono">{node.fqdn}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => toggleMaintenance(node.id)}
                      title={node.status === 'maintenance' ? 'Go Online' : 'Set Maintenance'}
                      className="p-1.5 text-gray-500 hover:text-mc-gold transition-colors"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => deleteNode(node.id)}
                      className="p-1.5 text-gray-500 hover:text-mc-redstone transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                  {[
                    { icon: Server, label: 'Servers', value: node.servers },
                    { icon: HardDrive, label: 'RAM', value: `${node.usedRam}/${node.totalRam}` },
                    { icon: Cpu, label: 'CPU', value: `${node.usedCpu}/${node.totalCpu}` },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="bg-mc-dark-bg border border-mc-card-border px-3 py-2">
                      <Icon size={12} className="text-gray-500 mx-auto mb-1" />
                      <div className="text-white text-sm font-body font-bold">{value}</div>
                      <div className="text-gray-600 text-xs font-mono">{label}</div>
                    </div>
                  ))}
                </div>

                {/* Usage bars */}
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-gray-500">RAM Usage</span>
                      <span className={ramPct > 80 ? 'text-mc-redstone' : ramPct > 60 ? 'text-mc-gold' : 'text-mc-diamond'}>{ramPct}%</span>
                    </div>
                    <div className="mc-progress">
                      <div
                        className={`mc-progress-bar ${ramPct > 80 ? 'danger' : ramPct > 60 ? 'warning' : ''}`}
                        style={{ width: `${ramPct}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-gray-500">CPU Usage</span>
                      <span className={cpuPct > 80 ? 'text-mc-redstone' : cpuPct > 60 ? 'text-mc-gold' : 'text-mc-diamond'}>{cpuPct}%</span>
                    </div>
                    <div className="mc-progress">
                      <div
                        className={`mc-progress-bar ${cpuPct > 80 ? 'danger' : cpuPct > 60 ? 'warning' : ''}`}
                        style={{ width: `${cpuPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Connection info */}
                <div className="mt-4 bg-mc-dark-bg border border-mc-card-border px-4 py-2 text-xs font-mono text-gray-500 flex justify-between">
                  <span>🌐 {node.host}:{node.port}</span>
                  <span className={node.status === 'online' ? 'text-mc-emerald' : 'text-mc-gold'}>
                    {node.status === 'online' ? '✓ Reachable' : '⚠ Maintenance'}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
