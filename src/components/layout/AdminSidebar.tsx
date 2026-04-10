'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Users, Server, Package,
  CreditCard, Ticket, Globe, Settings, LogOut, Shield
} from 'lucide-react'

const adminNav = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Servers', href: '/admin/servers', icon: Server },
  { label: 'Plans', href: '/admin/plans', icon: Package },
  { label: 'Billing', href: '/admin/billing', icon: CreditCard },
  { label: 'Tickets', href: '/admin/tickets', icon: Ticket },
  { label: 'Nodes', href: '/admin/nodes', icon: Globe },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <motion.aside
      initial={{ x: -260 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3 }}
      className="w-64 min-h-screen bg-mc-card-bg border-r border-mc-card-border flex flex-col"
      style={{ borderRight: '1px solid #2A2A3E' }}
    >
      {/* Admin Logo */}
      <div className="px-6 py-5 border-b border-mc-card-border">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-mc-redstone border-2 border-red-700 flex items-center justify-center pixel-art">
            <Shield size={14} className="text-white" />
          </div>
          <div>
            <div className="text-white text-xs font-minecraft" style={{ fontFamily: "'Press Start 2P', monospace" }}>
              ADMIN
            </div>
            <div className="text-mc-redstone text-xs font-mono">Cubiq Host</div>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-4">
        {adminNav.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`sidebar-item ${isActive ? 'active border-l-mc-redstone text-mc-redstone bg-mc-hover-bg' : ''}`}
            >
              <Icon size={16} className={isActive ? 'text-mc-redstone' : 'text-gray-500'} />
              <span>{label}</span>
              {isActive && (
                <motion.div
                  layoutId="admin-indicator"
                  className="ml-auto w-1.5 h-1.5 bg-mc-redstone"
                />
              )}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-mc-card-border">
        <Link href="/" className="sidebar-item text-gray-500 hover:text-white border-l-transparent text-xs">
          <LogOut size={14} /> Back to Site
        </Link>
      </div>
    </motion.aside>
  )
}
