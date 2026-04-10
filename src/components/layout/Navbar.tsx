'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Zap } from 'lucide-react'

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
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-mc-dark-bg/95 backdrop-blur-md border-b border-mc-card-border'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-8 h-8">
              {/* Minecraft grass block icon */}
              <div className="w-8 h-8 relative pixel-art">
                <div className="absolute inset-0 bg-mc-grass border-2 border-mc-grass-dark" />
                <div className="absolute bottom-0 left-0 right-0 h-5 bg-mc-dirt border-t-2 border-mc-grass-dark" />
                <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-green-300 opacity-60" />
              </div>
            </div>
            <span
              className="text-white font-minecraft text-sm group-hover:text-mc-diamond transition-colors duration-200"
              style={{ fontFamily: "'Press Start 2P', monospace" }}
            >
              CUBIQ
              <span className="text-mc-diamond"> HOST</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link ${pathname === link.href ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="mc-btn-outline px-4 py-2 text-xs uppercase tracking-wider border border-mc-card-border text-gray-400 hover:text-mc-diamond hover:border-mc-diamond transition-all duration-200">
              Login
            </Link>
            <Link href="/register" className="mc-btn text-xs px-4 py-2 flex items-center gap-2">
              <Zap size={12} />
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-gray-400 hover:text-white transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-mc-dark-bg border-b border-mc-card-border overflow-hidden"
          >
            <div className="px-4 py-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-3 text-sm font-body uppercase tracking-wider transition-colors ${
                    pathname === link.href
                      ? 'text-mc-diamond bg-mc-hover-bg border-l-2 border-mc-diamond'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex gap-2 pt-2">
                <Link href="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2 text-xs uppercase border border-mc-card-border text-gray-400">
                  Login
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="flex-1 mc-btn text-xs py-2 text-center">
                  Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
