'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DashboardHeader from '@/components/layout/DashboardHeader'
import { Plus, Edit2, Trash2, Save, X, RefreshCw, Star } from 'lucide-react'
import { createClient, type Plan } from '@/lib/supabase'
import { useAdminGuard } from '@/lib/useAdmin'

const EMPTY_PLAN = {
  name: '', display_name: '', type: 'minecraft', price: 0,
  ram: 1024, cpu: 100, disk: 10240, databases: 1, backups: 1,
  max_players: 20, bandwidth: 'Unlimited', features: [] as string[],
  is_active: true, is_featured: false, sort_order: 0,
}

export default function AdminPlansPage() {
  const { isAdmin, loading: authLoading } = useAdminGuard()
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editPlan, setEditPlan] = useState<Plan | null>(null)
  const [form, setForm] = useState<any>(EMPTY_PLAN)
  const [featuresText, setFeaturesText] = useState('')
  const [saving, setSaving] = useState(false)
  const [actionId, setActionId] = useState<string | null>(null)
  const [tab, setTab] = useState<'minecraft' | 'bot'>('minecraft')
  const supabase = createClient()

  const loadPlans = async () => {
    setLoading(true)
    const { data } = await supabase.from('plans').select('*').order('sort_order')
    setPlans(data || [])
    setLoading(false)
  }

  useEffect(() => { if (isAdmin) loadPlans() }, [isAdmin])

  const openCreate = () => {
    setForm({ ...EMPTY_PLAN, type: tab })
    setFeaturesText('')
    setEditPlan(null)
    setShowForm(true)
  }

  const openEdit = (plan: Plan) => {
    setForm({ ...plan })
    setFeaturesText((plan.features || []).join('\n'))
    setEditPlan(plan)
    setShowForm(true)
  }

  const savePlan = async () => {
    if (!form.name || !form.display_name) return
    setSaving(true)

    const payload = {
      ...form,
      name: form.name.toLowerCase().replace(/\s+/g, '-'),
      features: featuresText.split('\n').map((f: string) => f.trim()).filter(Boolean),
      price: parseInt(form.price),
      ram: parseInt(form.ram),
      cpu: parseInt(form.cpu),
      disk: parseInt(form.disk),
      databases: parseInt(form.databases),
      backups: parseInt(form.backups),
      max_players: parseInt(form.max_players),
      sort_order: parseInt(form.sort_order),
    }
    delete payload.id
    delete payload.created_at

    if (editPlan) {
      await supabase.from('plans').update(payload).eq('id', editPlan.id)
    } else {
      await supabase.from('plans').insert(payload)
    }

    await loadPlans()
    setShowForm(false)
    setSaving(false)
  }

  const deletePlan = async (id: string) => {
    if (!confirm('Delete this plan? Existing servers on this plan will not be affected.')) return
    setActionId(id)
    await supabase.from('plans').delete().eq('id', id)
    setPlans(prev => prev.filter(p => p.id !== id))
    setActionId(null)
  }

  const toggleActive = async (plan: Plan) => {
    await supabase.from('plans').update({ is_active: !plan.is_active }).eq('id', plan.id)
    setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, is_active: !p.is_active } : p))
  }

  if (authLoading || !isAdmin) return null

  const filtered = plans.filter(p => p.type === tab)

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      <DashboardHeader title="Plan Management" />
      <div className="p-6">
        {/* Type tabs */}
        <div className="flex border-b border-mc-card-border mb-6">
          {(['minecraft', 'bot'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-3 text-sm font-body uppercase tracking-wider transition-all border-b-2 -mb-px capitalize ${tab === t ? 'text-mc-diamond border-mc-diamond' : 'text-gray-500 border-transparent hover:text-white'}`}>
              {t === 'minecraft' ? '🎮' : '🤖'} {t}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2 pb-3">
            <button onClick={loadPlans} className="border border-mc-card-border text-gray-500 hover:text-white px-3 py-2 text-xs transition-all">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
            <button onClick={openCreate} className="mc-btn flex items-center gap-2 text-xs px-4 py-2">
              <Plus size={14} /> New Plan
            </button>
          </div>
        </div>

        {/* Plans Table */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mc-card border border-mc-card-border overflow-x-auto">
          <table className="w-full text-sm font-body min-w-[700px]">
            <thead>
              <tr className="border-b border-mc-card-border text-left">
                {['Plan', 'Price', 'RAM', 'CPU', 'Disk', 'Featured', 'Active', 'Order', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-xs font-mono text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-mc-card-border">
              {loading ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-600 font-mono text-sm">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-600 font-mono text-sm">No plans. Create one above.</td></tr>
              ) : filtered.map((plan, i) => (
                <motion.tr key={plan.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                  className="hover:bg-mc-hover-bg transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-white font-body font-semibold">{plan.display_name}</span>
                    <div className="text-gray-600 text-xs font-mono">{plan.name}</div>
                  </td>
                  <td className="px-4 py-3 text-mc-gold font-body font-bold">₹{plan.price}<span className="text-gray-600 font-normal text-xs">/mo</span></td>
                  <td className="px-4 py-3 text-gray-300 text-xs font-mono">{Math.round(plan.ram / 1024)}GB</td>
                  <td className="px-4 py-3 text-gray-300 text-xs font-mono">{plan.cpu / 100} vCore{plan.cpu > 100 ? 's' : ''}</td>
                  <td className="px-4 py-3 text-gray-300 text-xs font-mono">{Math.round(plan.disk / 1024)}GB</td>
                  <td className="px-4 py-3">
                    {plan.is_featured
                      ? <Star size={14} className="text-mc-gold fill-mc-gold" />
                      : <span className="text-gray-700 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(plan)}
                      className={`w-10 h-5 border relative transition-all ${plan.is_active ? 'bg-mc-grass border-mc-grass-dark' : 'bg-mc-dark-bg border-mc-card-border'}`}>
                      <div className={`absolute top-0.5 w-3 h-3 bg-white pixel-art transition-all ${plan.is_active ? 'left-6' : 'left-0.5'}`} />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs font-mono">{plan.sort_order}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(plan)} className="p-1.5 text-gray-500 hover:text-mc-diamond transition-colors"><Edit2 size={13} /></button>
                      <button onClick={() => deletePlan(plan.id)} disabled={actionId === plan.id}
                        className="p-1.5 text-gray-500 hover:text-mc-redstone transition-colors">
                        {actionId === plan.id ? <RefreshCw size={13} className="animate-spin" /> : <Trash2 size={13} />}
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Form Modal */}
        <AnimatePresence>
          {showForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setShowForm(false)}>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                onClick={e => e.stopPropagation()}
                className="mc-card border border-mc-card-border p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white font-body font-bold text-base">{editPlan ? 'Edit Plan' : 'Create Plan'}</h3>
                  <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white"><X size={18} /></button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Internal Name (slug)', key: 'name', placeholder: 'diamond', span: false },
                    { label: 'Display Name', key: 'display_name', placeholder: 'DIAMOND', span: false },
                    { label: 'Price (₹/mo)', key: 'price', placeholder: '349', span: false },
                    { label: 'Sort Order', key: 'sort_order', placeholder: '3', span: false },
                    { label: 'RAM (MB)', key: 'ram', placeholder: '4096', span: false },
                    { label: 'CPU (%)', key: 'cpu', placeholder: '200', span: false },
                    { label: 'Disk (MB)', key: 'disk', placeholder: '40960', span: false },
                    { label: 'Max Players', key: 'max_players', placeholder: '30', span: false },
                    { label: 'Databases', key: 'databases', placeholder: '2', span: false },
                    { label: 'Backups', key: 'backups', placeholder: '5', span: false },
                    { label: 'Bandwidth', key: 'bandwidth', placeholder: '5TB', span: false },
                  ].map(({ label, key, placeholder, span }) => (
                    <div key={key} className={span ? 'col-span-2' : ''}>
                      <label className="block text-xs font-mono text-gray-400 uppercase mb-1">{label}</label>
                      <input type="text" value={form[key] ?? ''} onChange={e => setForm((p: any) => ({ ...p, [key]: e.target.value }))}
                        placeholder={placeholder} className="mc-input w-full" />
                    </div>
                  ))}

                  <div>
                    <label className="block text-xs font-mono text-gray-400 uppercase mb-1">Type</label>
                    <select value={form.type} onChange={e => setForm((p: any) => ({ ...p, type: e.target.value }))} className="mc-input w-full">
                      <option value="minecraft">Minecraft</option>
                      <option value="bot">Bot</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-xs font-mono text-gray-400 uppercase mb-1">Features (one per line)</label>
                  <textarea rows={5} value={featuresText} onChange={e => setFeaturesText(e.target.value)}
                    placeholder={'All Modpacks\nAdvanced DDoS\nHourly Backups\nPriority Support'}
                    className="mc-input w-full resize-none" />
                </div>

                <div className="flex gap-6 mt-4">
                  {[
                    { key: 'is_active', label: 'Active (visible to users)' },
                    { key: 'is_featured', label: 'Featured (shown as popular)' },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <button type="button" onClick={() => setForm((p: any) => ({ ...p, [key]: !p[key] }))}
                        className={`w-5 h-5 border-2 flex items-center justify-center transition-all ${form[key] ? 'bg-mc-grass border-mc-grass-dark' : 'border-mc-card-border'}`}>
                        {form[key] && <span className="text-white text-xs">✓</span>}
                      </button>
                      <span className="text-gray-400 text-sm font-body">{label}</span>
                    </label>
                  ))}
                </div>

                <div className="flex gap-3 mt-6">
                  <button onClick={savePlan} disabled={saving || !form.name || !form.display_name}
                    className="mc-btn-diamond flex items-center gap-2 px-6 py-2 text-sm disabled:opacity-50">
                    {saving ? <><RefreshCw size={14} className="animate-spin" /> Saving...</> : <><Save size={14} /> {editPlan ? 'Update' : 'Create'} Plan</>}
                  </button>
                  <button onClick={() => setShowForm(false)} className="border border-mc-card-border text-gray-400 px-4 py-2 text-sm hover:text-white transition-colors">Cancel</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
