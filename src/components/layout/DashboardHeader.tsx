'use client'

import { Bell, Search } from 'lucide-react'
import { useState } from 'react'

export default function DashboardHeader({ title }: { title: string }) {
  const [notifications] = useState(3)

  return (
    <header className="h-16 bg-mc-card-bg border-b border-mc-card-border flex items-center justify-between px-6">
      <div>
        <h1 className="text-white font-body font-semibold text-lg tracking-wide">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden sm:block">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search..."
            className="mc-input pl-8 pr-4 py-2 text-sm w-48 bg-mc-dark-bg"
          />
        </div>
        {/* Notifications */}
        <button className="relative w-9 h-9 flex items-center justify-center border border-mc-card-border text-gray-400 hover:text-mc-diamond hover:border-mc-diamond transition-all">
          <Bell size={16} />
          {notifications > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-mc-redstone text-white text-xs flex items-center justify-center font-mono">
              {notifications}
            </span>
          )}
        </button>
        {/* User Avatar */}
        <div className="w-9 h-9 bg-mc-grass border-2 border-mc-grass-dark flex items-center justify-center text-xs font-minecraft text-white cursor-pointer pixel-art">
          S
        </div>
      </div>
    </header>
  )
}
