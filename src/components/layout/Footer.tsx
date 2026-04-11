import Link from 'next/link'
import { Github, Twitter, MessageSquare } from 'lucide-react'

const footerLinks = {
  Products: [
    { label: 'Minecraft Hosting', href: '/pricing' },
    { label: 'Bot Hosting', href: '/pricing#bots' },
    { label: 'Features', href: '/features' },
    { label: 'Status', href: '/status' },
  ],
  Company: [
    { label: 'About Us', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
    { label: 'Contact', href: '/contact' },
  ],
  Support: [
    { label: 'Help Center', href: '/help' },
    { label: 'Discord', href: 'https://discord.gg/cubiqhost' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
  ],
}

export default function Footer() {
  return (
    <footer className="relative mt-24 border-t border-mc-card-border bg-mc-dark-bg">
      {/* Grass border decoration */}
      <div className="h-2 pixel-divider" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 relative pixel-art">
                <div className="absolute inset-0 bg-mc-grass border-2 border-mc-grass-dark" />
                <div className="absolute bottom-0 left-0 right-0 h-5 bg-mc-dirt border-t-2 border-mc-grass-dark" />
              </div>
              <span className="text-white font-minecraft text-sm" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                CUBIQ <span className="text-mc-diamond">HOST</span>
              </span>
            </Link>
            <p className="text-gray-500 text-sm font-body max-w-xs mb-6">
              Premium Minecraft and Discord bot hosting. Built for gamers, powered by enterprise infrastructure.
            </p>
            <div className="flex gap-3">
              {[
                { Icon: Twitter, href: '#', label: 'Twitter' },
                { Icon: Github, href: '#', label: 'GitHub' },
                { Icon: MessageSquare, href: '#', label: 'Discord' },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 flex items-center justify-center border border-mc-card-border text-gray-500 hover:text-mc-diamond hover:border-mc-diamond transition-all duration-200"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-white font-body font-semibold uppercase tracking-wider text-xs mb-4 text-mc-stone">
                {category}
              </h4>
              <ul className="flex flex-col gap-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-gray-500 hover:text-white text-sm font-body transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t border-mc-card-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-xs font-mono">
            © 2024 Cubiq Host. All rights reserved. Not affiliated with Mojang.
          </p>
          <div className="flex items-center gap-2 text-xs font-mono text-gray-600">
            <div className="w-2 h-2 bg-mc-emerald rounded-full" style={{ boxShadow: '0 0 6px #00FF5A' }} />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  )
}
