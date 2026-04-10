'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    q: 'How fast is server deployment?',
    a: 'Your Minecraft server or Discord bot is deployed automatically within 60 seconds of payment confirmation. No manual intervention required — our system talks directly to the Pterodactyl panel API.',
  },
  {
    q: 'Can I upgrade my plan later?',
    a: 'Yes! You can upgrade or downgrade your plan anytime from the dashboard. Upgrades are instant and prorated. Your server data is preserved during plan changes.',
  },
  {
    q: 'What Minecraft versions are supported?',
    a: 'We support all Minecraft versions from 1.8 to the latest snapshot. Supported server types include: Vanilla, Paper, Spigot, Bukkit, Forge, Fabric, SpongeForge, and BungeeCord/Velocity proxies.',
  },
  {
    q: 'Do you support modpacks?',
    a: 'Yes! Over 100 modpacks are available with one-click install including popular packs like SkyFactory, FTB, RLCraft, Create, All the Mods, and more. You can also upload custom modpacks.',
  },
  {
    q: 'What kind of DDoS protection do you offer?',
    a: 'We use enterprise-grade DDoS mitigation that can handle attacks up to 1Tbps. Layer 3, 4, and 7 protection is included on all plans. Our network has never gone down from an attack.',
  },
  {
    q: 'Can I host a Discord bot?',
    a: 'Absolutely. Our bot hosting plans support Node.js, Python, Java, and Go bots. Just upload your files, set your start command, and deploy. Full file manager and console access included.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept UPI, credit/debit cards, net banking, and wallets via Razorpay. All transactions are secure and encrypted. Invoices are emailed automatically.',
  },
  {
    q: 'Is there a free trial?',
    a: "We don't offer a free trial, but we do offer a 7-day money-back guarantee. If you're not satisfied within 7 days of your first purchase, we'll refund you in full — no questions asked.",
  },
]

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className={`border border-mc-card-border transition-colors duration-200 ${open ? 'border-mc-diamond/30' : 'hover:border-mc-stone/30'}`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left gap-4"
      >
        <span className={`font-body font-semibold text-sm transition-colors ${open ? 'text-mc-diamond' : 'text-white'}`}>
          {q}
        </span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className={`flex-shrink-0 ${open ? 'text-mc-diamond' : 'text-gray-500'}`}
        >
          <ChevronDown size={18} />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-5 text-gray-400 text-sm font-body leading-relaxed border-t border-mc-card-border pt-4">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function FAQSection() {
  return (
    <section className="py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-mc-stone/30 bg-mc-stone/5 mb-6">
            <span className="text-mc-stone text-xs font-mono uppercase tracking-widest">FAQ</span>
          </div>
          <h2 className="text-white" style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '1.4rem', lineHeight: '2rem' }}>
            COMMON<br />
            <span className="text-mc-diamond">QUESTIONS</span>
          </h2>
        </motion.div>

        <div className="flex flex-col gap-2">
          {faqs.map((faq, i) => (
            <FAQItem key={i} q={faq.q} a={faq.a} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
