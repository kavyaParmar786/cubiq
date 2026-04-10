'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Server, FileText, CreditCard,
  Ticket, Settings, LogOut, Bot, Zap
} from 'lucide-react'

const sidebarItems = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'My Servers', href: '/dashboard/servers', icon: Server },
  { label: 'Bot Hosting', href: '/dashboard/bots', icon: Bot },
  { label: 'Billing', href: '/dashboard/billing', icon: CreditCard },
  { label: 'Support', href: '/dashboard/tickets', icon: Ticket },
  { label: 'File Manager', href: '/dashboard/files', icon: FileText },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export default function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <motion.aside
      initial={{ x: -260 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3 }}
      className="w-64 min-h-screen bg-mc-card-bg border-r border-mc-card-border flex flex-col"
    >
      {/* Logo */}
      <div className="px-6 py-5 border-b border-mc-card-border">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-7 h-7 relative pixel-art">
            <div className="absolute inset-0 bg-mc-grass border-2 border-mc-grass-dark" />
            <div className="absolute bottom-0 left-0 right-0 h-4 bg-mc-dirt border-t-2 border-mc-grass-dark" />
          </div>
          <span className="text-white text-xs" style={{ fontFamily: "'Press Start 2P', monospace" }}>
            CUBIQ <span className="text-mc-diamond">HOST</span>
          </span>
        </Link>
      </div>

      {/* Server Quick-Create Button */}
      <div className="px-4 py-4 border-b border-mc-card-border">
        <Link
          href="/dashboard/servers/create"
          className="mc-btn flex items-center justify-center gap-2 w-full text-xs py-2.5"
        >
          <Zap size={12} />
          New Server
        </Link>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-4">
        {sidebarItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={16} className={isActive ? 'text-mc-diamond' : 'text-gray-500'} />
              <span>{label}</span>
              {isActive && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="ml-auto w-1.5 h-1.5 bg-mc-diamond"
                />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-mc-card-border">
        <button className="sidebar-item w-full text-red-500 hover:text-red-400 hover:bg-red-900/10 border-l-transparent">
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </motion.aside>
  )
}
