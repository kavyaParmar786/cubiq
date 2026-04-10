'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DashboardHeader from '@/components/layout/DashboardHeader'
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react'

interface Plan {
  id: string
  name: string
  type: 'minecraft' | 'bot'
  price: number
  ram: string
  cpu: string
  storage: string
  bandwidth: string
  maxPlayers: string
  active: boolean
}

const initialPlans: Plan[] = [
  { id: 'p1', name: 'DIRT', type: 'minecraft', price: 99, ram: '1GB', cpu: '1 vCore', storage: '10GB SSD', bandwidth: '1TB', maxPlayers: '5', active: true },
  { id: 'p2', name: 'IRON', type: 'minecraft', price: 179, ram: '2GB', cpu: '1 vCore', storage: '20GB NVMe', bandwidth: '2TB', maxPlayers: '15', active: true },
  { id: 'p3', name: 'DIAMOND', type: 'minecraft', price: 349, ram: '4GB', cpu: '2 vCores', storage: '40GB NVMe', bandwidth: '5TB', maxPlayers: '30', active: true },
  { id: 'p4', name: 'EMERALD', type: 'minecraft', price: 599, ram: '8GB', cpu: '3 vCores', storage: '60GB NVMe', bandwidth: '10TB', maxPlayers: '60', active: true },
  { id: 'p5', name: 'NETHERITE', type: 'minecraft', price: 999, ram: '16GB', cpu: '4 vCores', storage: '100GB NVMe', bandwidth: 'Unlimited', maxPlayers: 'Unlimited', active: true },
  { id: 'p6', name: 'BOT STARTER', type: 'bot', price: 79, ram: '512MB', cpu: '0.5 vCore', storage: '5GB SSD', bandwidth: '500GB', maxPlayers: '—', active: true },
  { id: 'p7', name: 'BOT PRO', type: 'bot', price: 149, ram: '1GB', cpu: '1 vCore', storage: '15GB SSD', bandwidth: '1TB', maxPlayers: '—', active: true },
  { id: 'p8', name: 'BOT ULTRA', type: 'bot', price: 299, ram: '2GB', cpu: '2 vCores', storage: '30GB NVMe', bandwidth: '2TB', maxPlayers: '—', active: true },
]

const emptyPlan: Omit<Plan, 'id'> = {
  name: '', type: 'minecraft', price: 0, ram: '', cpu: '', storage: '', bandwidth: '', maxPlayers: '', active: true,
}

export default function AdminPlansPage() {
  const [plans, setPlans] = useState(initialPlans)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [newPlan, setNewPlan] = useState<Omit<Plan, 'id'>>(emptyPlan)
  const [typeFilter, setTypeFilter] = useState<'all' | 'minecraft' | 'bot'>('all')

  const filtered = typeFilter === 'all' ? plans : plans.filter(p => p.type === typeFilter)

  const savePlan = () => {
    if (editingPlan) {
      setPlans(prev => prev.map(p => p.id === editingPlan.id ? editingPlan : p))
      setEditingPlan(null)
    }
  }

  const createPlan = () => {
    const plan: Plan = { ...newPlan, id: `p${Date.now()}` }
    setPlans(prev => [...prev, plan])
    setIsCreating(false)
    setNewPlan(emptyPlan)
  }

  const deletePlan = (id: string) => {
    setPlans(prev => prev.filter(p => p.id !== id))
  }

  const toggleActive = (id: string) => {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p))
  }

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      <DashboardHeader title="Plan Management" />
      <div className="p-6">

        {/* Controls */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex gap-2">
            {(['all', 'minecraft', 'bot'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-4 py-2 text-xs font-mono uppercase border transition-all ${
                  typeFilter === t ? 'border-mc-diamond text-mc-diamond bg-mc-diamond/5' : 'border-mc-card-border text-gray-500 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="mc-btn flex items-center gap-2 text-xs px-4 py-2"
          >
            <Plus size={14} /> Create Plan
          </button>
        </div>

        {/* Create form */}
        <AnimatePresence>
          {isCreating && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mc-card p-6 mb-6 border border-mc-grass/20"
            >
              <h3 className="text-white font-body font-bold mb-4 flex items-center gap-2">
                <Plus size={16} className="text-mc-grass" /> Create New Plan
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {[
                  { label: 'Plan Name', key: 'name', placeholder: 'e.g. GOLD' },
                  { label: 'Price (₹/mo)', key: 'price', placeholder: '299', type: 'number' },
                  { label: 'RAM', key: 'ram', placeholder: '4GB' },
                  { label: 'CPU', key: 'cpu', placeholder: '2 vCores' },
                  { label: 'Storage', key: 'storage', placeholder: '40GB NVMe' },
                  { label: 'Bandwidth', key: 'bandwidth', placeholder: '5TB' },
                  { label: 'Max Players', key: 'maxPlayers', placeholder: '30 or Unlimited' },
                ].map(({ label, key, placeholder, type }) => (
                  <div key={key}>
                    <label className="block text-xs font-mono text-gray-400 uppercase mb-1">{label}</label>
                    <input
                      type={type || 'text'}
                      placeholder={placeholder}
                      value={(newPlan as any)[key]}
                      onChange={e => setNewPlan(p => ({ ...p, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
                      className="mc-input text-sm py-2"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-mono text-gray-400 uppercase mb-1">Type</label>
                  <select
                    value={newPlan.type}
                    onChange={e => setNewPlan(p => ({ ...p, type: e.target.value as 'minecraft' | 'bot' }))}
                    className="mc-input text-sm py-2"
                  >
                    <option value="minecraft">Minecraft</option>
                    <option value="bot">Bot</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={createPlan} disabled={!newPlan.name || !newPlan.price} className="mc-btn px-6 py-2 text-sm flex items-center gap-2 disabled:opacity-50">
                  <Save size={14} /> Create Plan
                </button>
                <button onClick={() => setIsCreating(false)} className="border border-mc-card-border text-gray-400 px-4 py-2 text-sm hover:text-white transition-colors flex items-center gap-1">
                  <X size={14} /> Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Plans Table */}
        <div className="mc-card border border-mc-card-border overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-mc-card-border">
                {['Name', 'Type', 'Price', 'RAM', 'CPU', 'Storage', 'Players', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-mono uppercase tracking-wider text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-mc-card-border">
              {filtered.map((plan, i) => (
                <motion.tr
                  key={plan.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="hover:bg-mc-hover-bg transition-colors"
                >
                  {editingPlan?.id === plan.id ? (
                    /* Inline edit row */
                    <>
                      <td className="px-4 py-2" colSpan={7}>
                        <div className="grid grid-cols-7 gap-2">
                          {['name', 'price', 'ram', 'cpu', 'storage', 'bandwidth', 'maxPlayers'].map((key, ki) => (
                            <input
                              key={key}
                              type={key === 'price' ? 'number' : 'text'}
                              value={(editingPlan as any)[key]}
                              onChange={e => setEditingPlan(p => p ? { ...p, [key]: key === 'price' ? Number(e.target.value) : e.target.value } : null)}
                              className="mc-input text-xs py-1.5"
                            />
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-2" colSpan={2}>
                        <div className="flex gap-2">
                          <button onClick={savePlan} className="px-3 py-1.5 bg-mc-grass border border-mc-grass-dark text-white text-xs flex items-center gap-1">
                            <Save size={11} /> Save
                          </button>
                          <button onClick={() => setEditingPlan(null)} className="px-3 py-1.5 border border-mc-card-border text-gray-400 text-xs">
                            Cancel
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3">
                        <span className="text-white font-body font-semibold text-sm">{plan.name}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`mc-badge text-xs ${plan.type === 'minecraft' ? 'text-mc-grass border-green-800' : 'text-purple-400 border-purple-800'}`}>
                          {plan.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-mc-gold font-body font-bold">₹{plan.price}</td>
                      <td className="px-4 py-3 text-gray-400 font-mono text-xs">{plan.ram}</td>
                      <td className="px-4 py-3 text-gray-400 font-mono text-xs">{plan.cpu}</td>
                      <td className="px-4 py-3 text-gray-400 font-mono text-xs">{plan.storage}</td>
                      <td className="px-4 py-3 text-gray-400 font-mono text-xs">{plan.maxPlayers}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleActive(plan.id)}
                          className={`mc-badge text-xs cursor-pointer hover:opacity-80 transition-opacity ${
                            plan.active ? 'text-mc-emerald border-green-800' : 'text-gray-500 border-gray-700'
                          }`}
                        >
                          {plan.active ? 'Active' : 'Hidden'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setEditingPlan(plan)}
                            className="p-1.5 text-gray-500 hover:text-mc-diamond transition-colors"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => deletePlan(plan.id)}
                            className="p-1.5 text-gray-500 hover:text-mc-redstone transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
