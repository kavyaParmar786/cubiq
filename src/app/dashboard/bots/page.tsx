'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import DashboardHeader from '@/components/layout/DashboardHeader'
import { Bot, Upload, Play, Square, RotateCcw, Terminal, Plus } from 'lucide-react'

const bots = [
  {
    id: 'b1',
    name: 'ModBot',
    runtime: 'Node.js 20',
    status: 'online',
    uptime: '7d 3h',
    ram: '128MB',
    cpu: '2%',
  },
]

export default function BotsPage() {
  const [botList, setBotList] = useState(bots)
  const [showCreate, setShowCreate] = useState(false)
  const [newBot, setNewBot] = useState({ name: '', runtime: 'nodejs', startCmd: 'node index.js' })
  const [uploading, setUploading] = useState(false)
  const [logs] = useState([
    { type: 'success', msg: '[ModBot] Logged in as ModBot#1234' },
    { type: 'info', msg: '[ModBot] Ready! Serving 15 guilds.' },
    { type: 'default', msg: '[ModBot] Received command: !help from Steve#0001' },
  ])

  const createBot = () => {
    setUploading(true)
    setTimeout(() => {
      setBotList(prev => [...prev, {
        id: `b${Date.now()}`,
        name: newBot.name,
        runtime: newBot.runtime === 'nodejs' ? 'Node.js 20' : 'Python 3.11',
        status: 'online',
        uptime: '0m',
        ram: '64MB',
        cpu: '1%',
      }])
      setShowCreate(false)
      setUploading(false)
    }, 2000)
  }

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      <DashboardHeader title="Bot Hosting" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-500 text-sm font-body">{botList.length} bot{botList.length !== 1 ? 's' : ''} deployed</p>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="mc-btn flex items-center gap-2 text-xs px-4 py-2"
          >
            <Plus size={14} /> Deploy Bot
          </button>
        </div>

        {/* Create form */}
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mc-card p-6 mb-6 border border-mc-diamond/20"
          >
            <h3 className="text-white font-body font-bold mb-4">Deploy New Bot</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-mono text-gray-400 uppercase mb-2">Bot Name</label>
                <input type="text" value={newBot.name} onChange={e => setNewBot(p => ({ ...p, name: e.target.value }))} placeholder="MyDiscordBot" className="mc-input" />
              </div>
              <div>
                <label className="block text-xs font-mono text-gray-400 uppercase mb-2">Runtime</label>
                <select value={newBot.runtime} onChange={e => setNewBot(p => ({ ...p, runtime: e.target.value }))} className="mc-input">
                  <option value="nodejs">Node.js 20</option>
                  <option value="python">Python 3.11</option>
                  <option value="go">Go 1.22</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono text-gray-400 uppercase mb-2">Start Command</label>
                <input type="text" value={newBot.startCmd} onChange={e => setNewBot(p => ({ ...p, startCmd: e.target.value }))} className="mc-input font-mono" />
              </div>
            </div>
            {/* File upload area */}
            <div className="border-2 border-dashed border-mc-card-border p-8 text-center mb-4 hover:border-mc-diamond/40 transition-colors cursor-pointer">
              <Upload size={32} className="text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500 text-sm font-body">Drop your bot files here or click to upload</p>
              <p className="text-gray-600 text-xs font-mono mt-1">.zip, .tar.gz supported</p>
            </div>
            <div className="flex gap-3">
              <button onClick={createBot} disabled={!newBot.name || uploading} className="mc-btn-diamond flex items-center gap-2 px-6 py-2 text-sm disabled:opacity-50">
                {uploading ? <><div className="w-4 h-4 border-2 border-current/30 border-t-current animate-spin" /> Deploying...</> : <><Bot size={14} /> Deploy</>}
              </button>
              <button onClick={() => setShowCreate(false)} className="border border-mc-card-border text-gray-400 px-4 py-2 text-sm hover:text-white transition-colors">Cancel</button>
            </div>
          </motion.div>
        )}

        {/* Bot Cards */}
        {botList.map((bot, i) => (
          <motion.div key={bot.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="mc-card p-6 mb-4">
            <div className="flex flex-col lg:flex-row lg:items-start gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 bg-mc-diamond/10 border border-mc-diamond/20 flex items-center justify-center flex-shrink-0">
                  <Bot size={22} className="text-mc-diamond" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-white font-body font-bold">{bot.name}</h3>
                    <div className={`status-${bot.status}`}>{bot.status}</div>
                  </div>
                  <div className="text-xs font-mono text-gray-500 flex flex-wrap gap-4">
                    <span>{bot.runtime}</span>
                    <span>⏱ {bot.uptime}</span>
                    <span>🖥️ {bot.cpu}</span>
                    <span>💾 {bot.ram}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-2 border border-mc-gold/40 text-mc-gold hover:bg-mc-gold/10 text-xs uppercase flex items-center gap-1 transition-all">
                  <RotateCcw size={12} /> Restart
                </button>
                <button className="px-3 py-2 border border-mc-redstone/40 text-mc-redstone hover:bg-mc-redstone/10 text-xs uppercase flex items-center gap-1 transition-all">
                  <Square size={12} /> Stop
                </button>
                <button className="mc-btn-diamond px-3 py-2 text-xs flex items-center gap-1">
                  <Terminal size={12} /> Console
                </button>
              </div>
            </div>

            {/* Console preview */}
            <div className="mt-4 mc-console h-28 overflow-y-auto">
              {logs.map((log, li) => (
                <div key={li} className={`mc-console-line ${log.type}`}>{log.msg}</div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
