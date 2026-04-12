# ⚡ Cubiq Host — Minecraft & Bot Hosting Platform

A full-stack SaaS hosting platform inspired by Shockbyte/Hostinger, built with a Minecraft-themed dark UI.

## 🗂️ Project Structure

```
cubiq-host/
├── src/                          # Next.js Frontend
│   ├── app/
│   │   ├── page.tsx              # Home page
│   │   ├── layout.tsx            # Root layout
│   │   ├── pricing/page.tsx      # Pricing page
│   │   ├── features/page.tsx     # Features page
│   │   ├── status/page.tsx       # System status
│   │   ├── login/page.tsx        # Login
│   │   ├── register/page.tsx     # Register
│   │   ├── dashboard/            # Client dashboard
│   │   │   ├── page.tsx          # Dashboard overview
│   │   │   ├── servers/          # Server management
│   │   │   │   ├── page.tsx      # Server list
│   │   │   │   ├── create/       # Create wizard
│   │   │   │   └── [id]/         # Server detail + console
│   │   │   ├── bots/page.tsx     # Bot hosting
│   │   │   ├── billing/page.tsx  # Billing & invoices
│   │   │   ├── tickets/page.tsx  # Support tickets
│   │   │   ├── files/page.tsx    # File manager
│   │   │   └── settings/page.tsx # Account settings
│   │   └── admin/                # Admin panel
│   │       ├── page.tsx          # Admin dashboard
│   │       ├── users/page.tsx    # User management
│   │       ├── servers/page.tsx  # Server control
│   │       ├── plans/page.tsx    # Plan management
│   │       ├── billing/page.tsx  # Payment control
│   │       ├── tickets/page.tsx  # Ticket management
│   │       ├── nodes/page.tsx    # Node management
│   │       └── settings/page.tsx # Settings
│   ├── components/
│   │   ├── layout/               # Shared layout components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── DashboardSidebar.tsx
│   │   │   ├── DashboardHeader.tsx
│   │   │   └── AdminSidebar.tsx
│   │   └── minecraft/            # Theme components
│   │       ├── HeroSection.tsx
│   │       ├── FeaturesSection.tsx
│   │       ├── PricingPreview.tsx
│   │       ├── PricingContent.tsx
│   │       ├── TestimonialsSection.tsx
│   │       ├── FAQSection.tsx
│   │       └── CTASection.tsx
│   ├── lib/
│   │   ├── api.ts                # API client (all endpoints)
│   │   └── auth-context.tsx      # Auth context provider
│   └── styles/
│       └── globals.css           # Minecraft theme CSS
│
├── backend/                      # Express Backend
│   ├── server.js                 # Entry point
│   ├── routes/
│   │   ├── auth.js               # Register, login, reset
│   │   ├── servers.js            # Server CRUD + power
│   │   ├── tickets.js            # Support tickets
│   │   ├── billing.js            # Razorpay payments
│   │   ├── admin.js              # Admin endpoints
│   │   ├── nodes.js              # Node listing
│   │   └── bots.js               # Bot hosting
│   ├── models/
│   │   ├── User.js               # User model
│   │   ├── Server.js             # Server model
│   │   └── models.js             # Plan, Ticket, Payment, Node
│   ├── middleware/
│   │   └── auth.js               # JWT auth + admin check
│   └── utils/
│       ├── pterodactyl.js        # Pterodactyl API wrapper
│       ├── email.js              # Nodemailer templates
│       ├── socketHandler.js      # Socket.io live stats
│       └── seed.js               # Database seeder
│
├── .env.example                  # Environment variables template
├── package.json                  # Frontend deps
├── tailwind.config.js            # Minecraft theme config
├── next.config.js
└── tsconfig.json
```

## 🚀 Quick Start

### 1. Clone & Install

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend && npm install
```

### 2. Environment Setup

```bash
cp .env.example .env.local        # Frontend
cp .env.example backend/.env      # Backend
```

Fill in your values in both `.env` files.

### 3. Database Setup

Start MongoDB, then seed the database:

```bash
cd backend
node utils/seed.js
```

This creates:
- Admin user (`admin@cubiqhost.com` / `Admin@123456`)
- All 8 hosting plans
- 5 server nodes

### 4. Run Development Servers

```bash
# Terminal 1: Frontend (Next.js)
npm run dev          # http://localhost:3000

# Terminal 2: Backend (Express)
cd backend
npm run dev          # http://localhost:5000
```

## 🌐 Routes

| Path | Description |
|------|-------------|
| `/` | Home page |
| `/pricing` | Pricing plans |
| `/features` | Features page |
| `/status` | System status |
| `/login` | Login |
| `/register` | Register |
| `/dashboard` | Client dashboard |
| `/dashboard/servers` | My servers |
| `/dashboard/servers/create` | Create server wizard |
| `/dashboard/servers/[id]` | Server console & management |
| `/dashboard/bots` | Bot hosting |
| `/dashboard/billing` | Billing & invoices |
| `/dashboard/tickets` | Support tickets |
| `/dashboard/files` | File manager |
| `/dashboard/settings` | Account settings |
| `/admin` | Admin overview |
| `/admin/users` | User management |
| `/admin/servers` | Server control |
| `/admin/plans` | Plan management |
| `/admin/billing` | Payment control |
| `/admin/tickets` | Ticket management |
| `/admin/nodes` | Node management |
| `/admin/settings` | Admin settings |

## 🔌 API Endpoints

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
POST   /api/auth/forgot-password
POST   /api/auth/reset-password

GET    /api/servers
POST   /api/servers
GET    /api/servers/:id
POST   /api/servers/:id/power
DELETE /api/servers/:id

GET    /api/tickets
POST   /api/tickets
POST   /api/tickets/:id/reply
PUT    /api/tickets/:id/close

GET    /api/billing/plans
GET    /api/billing/invoices
POST   /api/billing/order
POST   /api/billing/verify

GET    /api/bots
POST   /api/bots
POST   /api/bots/:id/power
DELETE /api/bots/:id

GET    /api/admin/stats           (admin only)
GET    /api/admin/users           (admin only)
GET    /api/admin/servers         (admin only)
GET    /api/admin/plans           (admin only)
GET    /api/admin/tickets         (admin only)
GET    /api/admin/payments        (admin only)
GET    /api/admin/nodes           (admin only)
```

## ☁️ Deploy on Vercel

### Frontend (Vercel)

1. Push to GitHub
2. Import in Vercel
3. Set env vars (all `NEXT_PUBLIC_*` values)
4. Deploy!

### Backend (Railway / Render / VPS)

1. Deploy backend folder to Railway or Render
2. Set all env vars (MongoDB URI, JWT secret, Pterodactyl keys, etc.)
3. Update `NEXT_PUBLIC_API_URL` in Vercel to point to backend URL

## 🎮 Pterodactyl Setup

1. Install [Pterodactyl Panel](https://pterodactyl.io/)
2. Create an Application API Key in Admin → API
3. Set `PTERODACTYL_URL` and `PTERODACTYL_API_KEY` in backend `.env`
4. Make sure nodes are configured in your panel
5. Update node `pterodactylNodeId` values in `seed.js` to match your panel

## 💳 Razorpay Setup

1. Create account at [razorpay.com](https://razorpay.com)
2. Get test API keys from Dashboard → Settings → API Keys
3. Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in backend `.env`
4. Set `NEXT_PUBLIC_RAZORPAY_KEY_ID` in frontend `.env.local`

## 🎨 Theme Customization

All Minecraft theme tokens are in `tailwind.config.js` under `theme.extend.colors.mc`.

CSS custom properties are in `src/styles/globals.css`.

Key design elements:
- **Font**: Press Start 2P (headings), Rajdhani (body), Share Tech Mono (code)
- **Primary**: `#4EEBD0` (Diamond blue-green)
- **Accent**: `#5D9E2F` (Grass green)
- **Background**: `#0D0D14` (Dark obsidian)
- **Cards**: `#141420` with `#2A2A3E` borders

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS + Custom Minecraft theme |
| Animation | Framer Motion |
| Charts | Recharts |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Realtime | Socket.io |
| Email | Nodemailer |
| Payments | Razorpay |
| Panel | Pterodactyl API |

---

Built with ❤️ for the Minecraft hosting community.
