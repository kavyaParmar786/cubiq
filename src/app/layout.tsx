import type { Metadata } from 'next'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: {
    template: '%s | Cubiq Host',
    default: 'Cubiq Host — Minecraft & Bot Hosting',
  },
  description: 'Premium Minecraft server hosting and Discord bot hosting. Instant deploy, DDoS protection, 99.9% uptime. Start your server today.',
  keywords: ['minecraft hosting', 'bot hosting', 'game server', 'cubiq host', 'discord bot'],
  openGraph: {
    title: 'Cubiq Host — Minecraft & Bot Hosting',
    description: 'Premium Minecraft server and Discord bot hosting with instant deploy.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Share+Tech+Mono&family=Rajdhani:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
