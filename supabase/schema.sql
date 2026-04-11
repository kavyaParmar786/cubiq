-- ============================================================
-- CUBIQ HOST — Supabase Schema
-- Run this entire file in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── PROFILES (extends Supabase auth.users) ──────────────────
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  email text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  status text not null default 'active' check (status in ('active', 'suspended', 'banned')),
  pterodactyl_id integer default null,
  balance integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── NODES (admin-managed, hidden from users) ─────────────────
create table if not exists public.nodes (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  location_country text not null,
  location_city text not null,
  location_region text not null,
  location_flag text default '🌍',
  pterodactyl_node_id integer not null,
  status text not null default 'online' check (status in ('online', 'maintenance', 'offline')),
  ip text not null,
  fqdn text,
  total_ram integer not null,
  used_ram integer default 0,
  total_disk integer not null,
  used_disk integer default 0,
  total_cpu integer not null,
  used_cpu integer default 0,
  latency integer default 0,
  is_default boolean default false,
  created_at timestamptz not null default now()
);

-- ── PLANS ────────────────────────────────────────────────────
create table if not exists public.plans (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  display_name text not null,
  type text not null default 'minecraft' check (type in ('minecraft', 'bot')),
  price integer not null,
  ram integer not null,
  cpu integer not null,
  disk integer not null,
  databases integer default 1,
  backups integer default 1,
  max_players integer default 20,
  bandwidth text default 'Unlimited',
  features text[] default '{}',
  is_active boolean default true,
  is_featured boolean default false,
  sort_order integer default 0,
  created_at timestamptz not null default now()
);

-- ── SERVERS ──────────────────────────────────────────────────
create table if not exists public.servers (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  pterodactyl_server_id text unique,
  pterodactyl_uuid text unique,
  plan_id uuid references public.plans(id),
  node_id uuid references public.nodes(id),
  name text not null,
  type text not null default 'paper',
  version text not null default '1.20.4',
  status text not null default 'installing' check (status in ('installing', 'online', 'offline', 'starting', 'stopping', 'suspended', 'deleted')),
  connection_ip text,
  connection_port integer default 25565,
  connection_domain text,
  ram integer not null,
  cpu integer not null,
  disk integer not null,
  modpack text,
  suspend_reason text,
  next_billing_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── BOTS ─────────────────────────────────────────────────────
create table if not exists public.bots (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  pterodactyl_server_id text unique,
  name text not null,
  runtime text not null default 'nodejs' check (runtime in ('nodejs', 'python', 'go', 'java')),
  start_command text default 'node index.js',
  status text not null default 'offline' check (status in ('online', 'offline', 'installing', 'crashed')),
  plan_id uuid references public.plans(id),
  ram integer default 512,
  cpu integer default 50,
  disk integer default 5120,
  auto_restart boolean default true,
  created_at timestamptz not null default now()
);

-- ── TICKETS ──────────────────────────────────────────────────
create table if not exists public.tickets (
  id uuid primary key default uuid_generate_v4(),
  ticket_id text unique not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  subject text not null,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  status text not null default 'open' check (status in ('open', 'in-progress', 'waiting', 'closed')),
  category text default 'general' check (category in ('billing', 'technical', 'general', 'abuse')),
  assigned_to uuid references public.profiles(id) default null,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── TICKET MESSAGES ──────────────────────────────────────────
create table if not exists public.ticket_messages (
  id uuid primary key default uuid_generate_v4(),
  ticket_id uuid references public.tickets(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) not null,
  sender_role text not null default 'user' check (sender_role in ('user', 'admin')),
  content text not null,
  created_at timestamptz not null default now()
);

-- ── PAYMENTS ─────────────────────────────────────────────────
create table if not exists public.payments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  server_id uuid references public.servers(id) default null,
  plan_id uuid references public.plans(id) default null,
  razorpay_order_id text unique,
  razorpay_payment_id text unique,
  amount integer not null,
  currency text default 'INR',
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'refunded')),
  description text,
  invoice_id text unique,
  period_start timestamptz,
  period_end timestamptz,
  created_at timestamptz not null default now()
);

-- ── ROW LEVEL SECURITY ────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.nodes enable row level security;
alter table public.plans enable row level security;
alter table public.servers enable row level security;
alter table public.bots enable row level security;
alter table public.tickets enable row level security;
alter table public.ticket_messages enable row level security;
alter table public.payments enable row level security;

-- Profiles: users see own, admins see all
create policy "profiles_own" on public.profiles
  for all using (auth.uid() = id);
create policy "profiles_admin" on public.profiles
  for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Plans: everyone can read active plans
create policy "plans_read" on public.plans
  for select using (is_active = true);
create policy "plans_admin" on public.plans
  for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Nodes: only admins can see/manage
create policy "nodes_admin" on public.nodes
  for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Servers: users see own
create policy "servers_own" on public.servers
  for all using (user_id = auth.uid());
create policy "servers_admin" on public.servers
  for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Bots: users see own
create policy "bots_own" on public.bots
  for all using (user_id = auth.uid());
create policy "bots_admin" on public.bots
  for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Tickets: users see own
create policy "tickets_own" on public.tickets
  for all using (user_id = auth.uid());
create policy "tickets_admin" on public.tickets
  for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Messages: via ticket ownership
create policy "messages_own" on public.ticket_messages
  for all using (
    exists (select 1 from public.tickets where id = ticket_id and user_id = auth.uid())
    or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Payments: users see own
create policy "payments_own" on public.payments
  for all using (user_id = auth.uid());
create policy "payments_admin" on public.payments
  for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- ── TRIGGER: auto-create profile on signup ────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, username, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'user')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── TRIGGER: auto ticket_id ───────────────────────────────────
create or replace function public.set_ticket_id()
returns trigger language plpgsql as $$
declare
  ticket_count integer;
begin
  select count(*) + 1 into ticket_count from public.tickets;
  new.ticket_id := 'TKT-' || lpad(ticket_count::text, 4, '0');
  return new;
end;
$$;

create trigger set_ticket_id_trigger
  before insert on public.tickets
  for each row execute procedure public.set_ticket_id();

-- ── TRIGGER: update updated_at ────────────────────────────────
create or replace function public.update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger update_servers_updated_at before update on public.servers
  for each row execute procedure public.update_updated_at();
create trigger update_tickets_updated_at before update on public.tickets
  for each row execute procedure public.update_updated_at();
create trigger update_profiles_updated_at before update on public.profiles
  for each row execute procedure public.update_updated_at();

-- ── SEED: Default Plans ───────────────────────────────────────
insert into public.plans (name, display_name, type, price, ram, cpu, disk, databases, backups, max_players, bandwidth, features, is_active, is_featured, sort_order)
values
  ('dirt', 'DIRT', 'minecraft', 99, 1024, 100, 10240, 1, 1, 5, '1TB', array['Vanilla/Paper/Spigot', 'Basic DDoS Protection', '1 Daily Backup', 'Standard Support'], true, false, 1),
  ('iron', 'IRON', 'minecraft', 179, 2048, 100, 20480, 1, 3, 15, '2TB', array['All Server Types', 'Enhanced DDoS', '3 Daily Backups', 'Plugin Installer'], true, false, 2),
  ('diamond', 'DIAMOND', 'minecraft', 349, 4096, 200, 40960, 2, 5, 30, '5TB', array['All Server Types', 'Advanced DDoS', 'Hourly Backups', 'Priority Support', 'Custom Domain', 'All Modpacks'], true, true, 3),
  ('emerald', 'EMERALD', 'minecraft', 599, 8192, 300, 61440, 3, 10, 60, '10TB', array['All Server Types', 'Advanced DDoS', 'Hourly Backups', 'Dedicated IP', 'All Modpacks', 'BungeeCord Ready'], true, false, 4),
  ('netherite', 'NETHERITE', 'minecraft', 999, 16384, 400, 102400, 5, 20, 999, 'Unlimited', array['Everything', 'Max DDoS 1Tbps', 'Real-time Backups', 'Priority 30min', 'Dedicated IP', 'All Modpacks'], true, false, 5),
  ('bot-starter', 'BOT STARTER', 'bot', 79, 512, 50, 5120, 0, 0, 0, 'Unlimited', array['Node.js / Python', '1 Bot Instance'], true, false, 10),
  ('bot-pro', 'BOT PRO', 'bot', 149, 1024, 100, 15360, 0, 0, 0, 'Unlimited', array['Node.js / Python / Go', '3 Bot Instances', 'Priority Support'], true, true, 11),
  ('bot-ultra', 'BOT ULTRA', 'bot', 299, 2048, 200, 30720, 0, 0, 0, 'Unlimited', array['All Runtimes', 'Unlimited Bots', 'Priority Support 1h'], true, false, 12)
on conflict (name) do nothing;
