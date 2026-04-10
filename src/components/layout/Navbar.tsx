'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Zap, ExternalLink } from 'lucide-react'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Features', href: '/features' },
  { label: 'Status', href: '/status' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false) }, [pathname])

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-mc-dark-bg/96 backdrop-blur-md border-b border-mc-card-border shadow-[0_4px_30px_rgba(0,0,0,0.4)]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* LOGO */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 relative pixel-art flex-shrink-0">
              <div className="absolute inset-0 bg-mc-grass border-2 border-mc-grass-dark" />
              <div className="absolute bottom-0 left-0 right-0 h-5 bg-mc-dirt border-t-2 border-mc-grass-dark" />
              <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-green-300 opacity-60" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ boxShadow: 'inset 0 0 8px rgba(78,235,208,0.3)' }} />
            </div>
            <span className="text-white font-minecraft text-sm group-hover:text-mc-diamond transition-colors duration-200"
              style={{ fontFamily: "'Press Start 2P', monospace" }}>
              CUBIQ<span className="text-mc-diamond"> HOST</span>
            </span>
          </Link>

          {/* DESKTOP NAV */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}
                className={`nav-link ${pathname === link.href ? 'active' : ''}`}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA BUTTONS */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="https://discord.gg/QE6VmHXsUp"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono uppercase tracking-wider text-gray-500 hover:text-indigo-400 transition-colors duration-200"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.079.11 18.1.128 18.11a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
              </svg>
              Discord
            </a>
            <Link href="/login" className="mc-btn-outline px-4 py-2 text-xs uppercase tracking-wider border border-mc-card-border text-gray-400 hover:text-mc-diamond hover:border-mc-diamond transition-all duration-200">
              Login
            </Link>
            <Link href="/register" className="mc-btn text-xs px-4 py-2 flex items-center gap-2">
              <Zap size={12} />
              Get Started
            </Link>
          </div>

          {/* MOBILE TOGGLE */}
          <button
            className="md:hidden text-gray-400 hover:text-white transition-colors p-1"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-mc-dark-bg/98 border-b border-mc-card-border overflow-hidden backdrop-blur-md"
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}
                  className={`px-4 py-3 text-sm font-body uppercase tracking-wider transition-all duration-150 ${
                    pathname === link.href
                      ? 'text-mc-diamond bg-mc-hover-bg border-l-2 border-mc-diamond pl-3'
                      : 'text-gray-400 hover:text-white hover:pl-5'
                  }`}>
                  {link.label}
                </Link>
              ))}
              <div className="flex gap-2 pt-3 border-t border-mc-card-border mt-2">
                <Link href="/login" className="flex-1 text-center py-2.5 text-xs uppercase border border-mc-card-border text-gray-400 hover:text-mc-diamond hover:border-mc-diamond transition-all">
                  Login
                </Link>
                <Link href="/register" className="flex-1 mc-btn text-xs py-2.5 text-center">
                  Get Started
                </Link>
              </div>
              <a href="https://discord.gg/QE6VmHXsUp" target="_blank" rel="noopener noreferrer"
                className="mt-2 flex items-center justify-center gap-2 py-2 text-xs text-indigo-400 font-mono">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.079.11 18.1.128 18.11a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
                </svg>
                Join our Discord
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
