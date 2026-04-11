/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  // All env vars are now managed via Supabase + .env.local
  // No separate backend needed — API routes handle everything
}

module.exports = nextConfig
