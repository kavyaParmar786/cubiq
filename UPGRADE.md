# Cubiq Host v2 — Upgrade Guide
## From mock data → Real Supabase + Pterodactyl

---

## STEP 1 — Install new packages

```bash
npm install @supabase/supabase-js @supabase/ssr resend
```

Remove old unused packages:
```bash
npm uninstall axios js-cookie react-hot-toast socket.io-client
```

---

## STEP 2 — Set up Supabase

1. Go to [supabase.com](https://supabase.com) → New Project
2. Open **SQL Editor** → paste the entire contents of `supabase/schema.sql` → Run
3. This creates all tables, RLS policies, triggers, and seeds 8 default plans

Get your keys from **Project Settings → API**:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

## STEP 3 — Set up Pterodactyl

You need a Pterodactyl panel. If you don't have one:
- Use [pterodactyl.io](https://pterodactyl.io/panel/1.0/getting_started.html) self-hosted
- Or a hosted panel like [WISP](https://wisp.gg)

### Get API keys:
- **Application API Key**: Admin Panel → API → Create Key (needs all permissions)
- **Client API Key**: Account → API Credentials → Create Key

### Get Egg IDs:
Admin Panel → Nests → click each egg → note the ID in the URL

```env
PTERODACTYL_URL=https://panel.yourdomain.com
PTERODACTYL_API_KEY=ptla_xxx
PTERODACTYL_CLIENT_KEY=ptlc_xxx
PTERODACTYL_PAPER_EGG_ID=1
PTERODACTYL_VANILLA_EGG_ID=2
PTERODACTYL_FORGE_EGG_ID=3
PTERODACTYL_FABRIC_EGG_ID=4
```

### Create your first node in Cubiq Admin:
1. Login as admin → `/admin/nodes` → Add Node
2. Fill in Pterodactyl Node ID (from Admin → Nodes in your panel)
3. Check "Set as Default" — new servers auto-assign to this node

---

## STEP 4 — Set up Email (Resend)

1. Go to [resend.com](https://resend.com) → Create account
2. Add & verify your domain
3. Create API key

```env
RESEND_API_KEY=re_xxx
EMAIL_FROM=Cubiq Host <noreply@yourdomain.com>
```

---

## STEP 5 — Set up Razorpay (optional)

1. Go to [razorpay.com](https://razorpay.com) → create account
2. Get test keys from Dashboard → Settings → API Keys

```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
```

> Without Razorpay keys set, billing pages show but payments use dev mock mode.

---

## STEP 6 — Create admin account

1. Go to `/register` → create your account
2. In Supabase Dashboard → Table Editor → `profiles` table
3. Find your row → change `role` from `user` to `admin`
4. Now `/admin` is accessible

---

## STEP 7 — Create your .env.local

```bash
cp .env.example .env.local
# Fill in all values
```

---

## STEP 8 — Run locally

```bash
npm run dev
```

Visit:
- `http://localhost:3000` → Public site
- `http://localhost:3000/dashboard` → Client panel  
- `http://localhost:3000/admin` → Admin panel

---

## STEP 9 — Deploy to Vercel

```bash
# Push to GitHub first, then:
vercel --prod
```

Set all env vars in Vercel Dashboard → Project → Settings → Environment Variables.

---

## What's New in v2

### Architecture Changes
| Old | New |
|-----|-----|
| Separate Express backend | Next.js API Routes (no separate server) |
| MongoDB + Mongoose | Supabase (PostgreSQL) |
| JWT in localStorage | Supabase Auth (secure cookies) |
| Mock/hardcoded data | Real database data |
| No auth guards | Middleware + RLS protects all routes |

### New Features
| Feature | File |
|---------|------|
| Supabase Auth (login/register) | `src/lib/auth-context.tsx` |
| Auth middleware (route protection) | `src/middleware.ts` |
| All TypeScript types | `src/lib/supabase.ts` |
| Pterodactyl API wrapper | `src/lib/pterodactyl.ts` |
| Email via Resend | `src/lib/email.ts` |
| Admin guard hook | `src/lib/useAdmin.ts` |
| Live server stats API | `src/app/api/servers/[id]/stats` |
| Real power controls | `src/app/api/servers/[id]/power` |
| Console commands | `src/app/api/servers/[id]/command` |
| Modpack install | `src/app/api/servers/[id]/modpack` |
| Realtime ticket chat | Supabase Realtime subscriptions |
| Admin email on ticket reply | `src/app/api/tickets/notify` |
| Razorpay order + verify | `src/app/api/billing/*` |
| Node management (hidden) | Admin nodes page + Supabase |
| Auto Pterodactyl user on signup | `src/app/api/auth/create-pterodactyl-user` |

### Database Schema
Run `supabase/schema.sql` once in Supabase SQL editor to get:
- 8 tables with proper foreign keys
- Row Level Security on every table
- Auto triggers (ticket IDs, updated_at, profile creation)
- Pre-seeded with 8 hosting plans
