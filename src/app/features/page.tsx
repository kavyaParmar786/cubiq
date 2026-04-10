import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import FeaturesSection from '@/components/minecraft/FeaturesSection'
import CTASection from '@/components/minecraft/CTASection'
import { motion } from 'framer-motion'

export const metadata: Metadata = {
  title: 'Features',
  description: 'Explore all Cubiq Host features: DDoS protection, instant deploy, modpack support, live stats, and more.',
}

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-mc-dark-bg">
      <Navbar />
      <main className="pt-24">
        {/* Page Hero */}
        <div className="max-w-4xl mx-auto px-4 text-center py-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-mc-grass/30 bg-mc-grass/5 mb-6">
            <span className="text-mc-grass text-xs font-mono uppercase tracking-widest">Platform Features</span>
          </div>
          <h1 className="text-white mb-4" style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '1.6rem', lineHeight: '2.4rem' }}>
            EVERYTHING YOU NEED<br />
            <span className="text-mc-diamond">TO RUN THE BEST SERVER</span>
          </h1>
          <p className="text-gray-400 font-body max-w-2xl mx-auto text-lg">
            Built from the ground up for Minecraft server owners and Discord bot developers. Every feature you need, none that you don't.
          </p>
        </div>

        <FeaturesSection />

        {/* Detailed Features */}
        <div className="max-w-7xl mx-auto px-4 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pterodactyl Panel */}
            <div className="mc-card p-8 border border-mc-diamond/20">
              <div className="text-4xl mb-4">🦕</div>
              <h3 className="text-white font-body font-bold text-xl mb-3">Pterodactyl Control Panel</h3>
              <p className="text-gray-400 font-body mb-4 leading-relaxed">
                Industry-leading open-source server management panel. Full file manager, console access, resource monitoring, and sub-user permissions — all in one beautiful interface.
              </p>
              <ul className="space-y-2 text-sm font-body text-gray-400">
                {['Web-based file manager with editor', 'Live console with command input', 'SFTP access for advanced users', 'Schedule tasks & restarts', 'Sub-user access control', 'Resource usage graphs'].map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-mc-diamond" /> {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Modpack Installer */}
            <div className="mc-card p-8 border border-mc-grass/20">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="text-white font-body font-bold text-xl mb-3">One-Click Modpack Installer</h3>
              <p className="text-gray-400 font-body mb-4 leading-relaxed">
                Over 100 pre-configured modpacks ready to deploy with a single click. No manual jar downloading, no classpath configuration. Just click and play.
              </p>
              <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                {['Forge', 'Fabric', 'Paper', 'Spigot', 'Purpur', 'SpongeForge', 'RLCraft', 'SkyFactory', 'FTB', 'Create', 'ATM9', 'VR Mod'].map(m => (
                  <div key={m} className="bg-mc-dark-bg border border-mc-card-border px-2 py-1 text-gray-400 text-center">{m}</div>
                ))}
              </div>
            </div>

            {/* Bot Hosting */}
            <div className="mc-card p-8 border border-mc-gold/20">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-white font-body font-bold text-xl mb-3">Discord Bot Hosting</h3>
              <p className="text-gray-400 font-body mb-4 leading-relaxed">
                Deploy your Discord bot alongside your Minecraft server. Upload files via browser or SFTP, set your start command, and go live instantly.
              </p>
              <ul className="space-y-2 text-sm font-body text-gray-400">
                {['Node.js, Python, Go, Java support', 'npm/pip dependency auto-install', 'Live console output', 'Auto-restart on crash', 'Environment variable support', '.env file management'].map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-mc-gold" /> {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Live Monitoring */}
            <div className="mc-card p-8 border border-mc-emerald/20">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-white font-body font-bold text-xl mb-3">Real-Time Monitoring</h3>
              <p className="text-gray-400 font-body mb-4 leading-relaxed">
                Live CPU, RAM, TPS, and player count graphs powered by WebSocket streams. Know exactly what's happening on your server at all times.
              </p>
              <ul className="space-y-2 text-sm font-body text-gray-400">
                {['CPU & RAM usage graphs', 'TPS (Ticks Per Second) monitor', 'Live player count', 'Network I/O stats', 'Disk usage alerts', 'Crash detection & alerts'].map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-mc-emerald" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
