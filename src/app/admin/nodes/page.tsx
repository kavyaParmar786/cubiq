'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DashboardHeader from '@/components/layout/DashboardHeader'
import { Globe, Plus, Edit2, Trash2, Save, X, RefreshCw, Star } from 'lucide-react'
import { createClient, type Node } from '@/lib/supabase'
import { useAdminGuard } from '@/lib/useAdmin'

const EMPTY_NODE = {
  name: '', location_country: '', location_city: '', location_region: 'india',
  location_flag: '🌍', pterodactyl_node_id: '', status: 'online', ip: '', fqdn: '',
  total_ram: 65536, total_disk: 1048576, total_cpu: 1600, is_default: false,
}

export default function AdminNodesPage() {
  const { isAdmin, loading: authLoading } = useAdminGuard()
  const [nodes, setNodes] = useState<Node[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editNode, setEditNode] = useState<Node | null>(null)
  const [form, setForm] = useState<any>(EMPTY_NODE)
  const [saving, setSaving] = useState(false)
  const [actionId, setActionId] = useState<string | null>(null)
  const supabase = createClient()

  const loadNodes = async () => {
    setLoading(true)
    const { data } = await supabase.from('nodes').select('*').order('created_at', { ascending: false })
    setNodes(data || [])
    setLoading(false)
  }

  useEffect(() => { if (isAdmin) loadNodes() }, [isAdmin])

  const openCreate = () => { setForm(EMPTY_NODE); setEditNode(null); setShowForm(true) }
  const openEdit = (node: Node) => { setForm({ ...node, pterodactyl_node_id: String(node.pterodactyl_node_id) }); setEditNode(node); setShowForm(true) }

  const saveNode = async () => {
    if (!form.name || !form.ip || !form.pterodactyl_node_id) return
    setSaving(true)
    const payload = { ...form, pterodactyl_node_id: parseInt(form.pterodactyl_node_id) }
    delete payload.id; delete payload.created_at

    if (editNode) {
      await supabase.from('nodes').update(payload).eq('id', editNode.id)
    } else {
      await supabase.from('nodes').insert(payload)
    }

    await loadNodes()
    setShowForm(false)
    setSaving(false)
  }

  const deleteNode = async (id: string) => {
    if (!confirm('Delete this node? Servers on this node must be migrated first.')) return
    setActionId(id)
    await supabase.from('nodes').delete().eq('id', id)
    setNodes(prev => prev.filter(n => n.id !== id))
    setActionId(null)
  }

  const setDefault = async (id: string) => {
    // Clear existing default
    await supabase.from('nodes').update({ is_default: false }).neq('id', 'none')
    await supabase.from('nodes').update({ is_default: true }).eq('id', id)
    setNodes(prev => prev.map(n => ({ ...n, is_default: n.id === id })))
  }

  if (authLoading || !isAdmin) return null

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      <DashboardHeader title="Node Management" />
      <div className="p-6">
        {/* Important notice */}
        <div className="mc-card p-4 border border-mc-diamond/20 bg-mc-diamond/5 mb-6">
          <p className="text-mc-diamond text-sm font-body">
            🔒 <strong>Nodes are admin-only.</strong> Users cannot see or select nodes — they are auto-assigned based on availability and your default setting.
          </p>
        </div>

        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-500 text-sm font-body">{nodes.length} node{nodes.length !== 1 ? 's' : ''} configured</p>
          <div className="flex gap-2">
            <button onClick={loadNodes} className="border border-mc-card-border text-gray-500 hover:text-white px-3 py-2 text-xs transition-all">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
            <button onClick={openCreate} className="mc-btn flex items-center gap-2 text-xs px-4 py-2">
              <Plus size={14} /> Add Node
            </button>
          </div>
        </div>

        {/* Nodes Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {nodes.map((node, i) => (
            <motion.div key={node.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className={`mc-card p-5 border transition-all ${node.is_default ? 'border-mc-diamond' : 'border-mc-card-border'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{node.location_flag}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-body font-bold">{node.name}</h3>
                      {node.is_default && <span className="mc-badge text-mc-diamond border-teal-800 text-xs"><Star size={8} className="inline mr-1" />DEFAULT</span>}
                    </div>
                    <p className="text-gray-500 text-xs font-mono">{node.location_city}, {node.location_country}</p>
                  </div>
                </div>
                <span className={`mc-badge text-xs ${node.status === 'online' ? 'text-mc-emerald border-green-800' : node.status === 'maintenance' ? 'text-mc-gold border-yellow-800' : 'text-mc-redstone border-red-800'}`}>
                  {node.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-4">
                {[
                  ['Pterodactyl ID', node.pterodactyl_node_id],
                  ['IP', node.ip],
                  ['RAM', `${Math.round(node.total_ram / 1024)}GB`],
                  ['Disk', `${Math.round(node.total_disk / 1024)}GB`],
                  ['FQDN', node.fqdn || '—'],
                  ['Region', node.location_region],
                ].map(([k, v]) => (
                  <div key={String(k)}>
                    <span className="text-gray-600">{k}: </span>
                    <span className="text-gray-300">{v}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                {!node.is_default && (
                  <button onClick={() => setDefault(node.id)} className="flex items-center gap-1 px-3 py-1.5 text-xs border border-mc-diamond/40 text-mc-diamond hover:bg-mc-diamond/10 transition-all uppercase font-body">
                    <Star size={10} /> Set Default
                  </button>
                )}
                <button onClick={() => openEdit(node)} className="flex items-center gap-1 px-3 py-1.5 text-xs border border-mc-card-border text-gray-400 hover:text-white transition-all uppercase font-body">
                  <Edit2 size={10} /> Edit
                </button>
                <button onClick={() => deleteNode(node.id)} disabled={actionId === node.id}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs border border-mc-redstone/40 text-mc-redstone hover:bg-mc-redstone/10 transition-all uppercase font-body">
                  {actionId === node.id ? <RefreshCw size={10} className="animate-spin" /> : <Trash2 size={10} />} Delete
                </button>
              </div>
            </motion.div>
          ))}

          {nodes.length === 0 && !loading && (
            <div className="col-span-2 mc-card p-12 text-center border border-dashed border-mc-card-border">
              <Globe size={32} className="text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 font-body text-sm mb-4">No nodes configured yet.</p>
              <button onClick={openCreate} className="mc-btn px-6 py-2 text-xs">Add First Node</button>
            </div>
          )}
        </div>

        {/* Create/Edit Form Modal */}
        <AnimatePresence>
          {showForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setShowForm(false)}>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                onClick={e => e.stopPropagation()} className="mc-card border border-mc-card-border p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white font-body font-bold text-base">{editNode ? 'Edit Node' : 'Add Node'}</h3>
                  <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white"><X size={18} /></button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Node Name', key: 'name', placeholder: 'Mumbai IN-1' },
                    { label: 'Pterodactyl Node ID', key: 'pterodactyl_node_id', placeholder: '1' },
                    { label: 'IP Address', key: 'ip', placeholder: '103.x.x.x' },
                    { label: 'FQDN (optional)', key: 'fqdn', placeholder: 'node1.example.com' },
                    { label: 'Country', key: 'location_country', placeholder: 'India' },
                    { label: 'City', key: 'location_city', placeholder: 'Mumbai' },
                    { label: 'Flag Emoji', key: 'location_flag', placeholder: '🇮🇳' },
                    { label: 'Total RAM (MB)', key: 'total_ram', placeholder: '65536' },
                    { label: 'Total Disk (MB)', key: 'total_disk', placeholder: '1048576' },
                    { label: 'Total CPU (%)', key: 'total_cpu', placeholder: '1600' },
                  ].map(({ label, key, placeholder }) => (
                    <div key={key}>
                      <label className="block text-xs font-mono text-gray-400 uppercase mb-1">{label}</label>
                      <input type="text" value={form[key] || ''} onChange={e => setForm((p: any) => ({ ...p, [key]: e.target.value }))}
                        placeholder={placeholder} className="mc-input w-full" />
                    </div>
                  ))}

                  <div>
                    <label className="block text-xs font-mono text-gray-400 uppercase mb-1">Region</label>
                    <select value={form.location_region} onChange={e => setForm((p: any) => ({ ...p, location_region: e.target.value }))} className="mc-input w-full">
                      {['india', 'us', 'europe', 'asia', 'australia'].map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-gray-400 uppercase mb-1">Status</label>
                    <select value={form.status} onChange={e => setForm((p: any) => ({ ...p, status: e.target.value }))} className="mc-input w-full">
                      {['online', 'maintenance', 'offline'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer mt-4">
                  <button type="button" onClick={() => setForm((p: any) => ({ ...p, is_default: !p.is_default }))}
                    className={`w-5 h-5 border-2 flex items-center justify-center transition-all ${form.is_default ? 'bg-mc-diamond border-teal-600' : 'border-mc-card-border'}`}>
                    {form.is_default && <span className="text-mc-obsidian text-xs font-bold">✓</span>}
                  </button>
                  <span className="text-gray-400 text-sm font-body">Set as default node (auto-assigned to new servers)</span>
                </label>

                <div className="flex gap-3 mt-6">
                  <button onClick={saveNode} disabled={saving || !form.name || !form.ip || !form.pterodactyl_node_id}
                    className="mc-btn-diamond flex items-center gap-2 px-6 py-2 text-sm disabled:opacity-50">
                    {saving ? <><RefreshCw size={14} className="animate-spin" /> Saving...</> : <><Save size={14} /> {editNode ? 'Update' : 'Create'} Node</>}
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
