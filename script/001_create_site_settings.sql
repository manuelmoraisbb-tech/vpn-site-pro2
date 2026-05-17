-- =====================================================================
-- site_settings table
-- Stores key/value site configuration (e.g. shrinkme_token).
-- Run this once in your Supabase SQL Editor.
-- =====================================================================

create table if not exists public.site_settings (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);

-- Enable Row Level Security.
alter table public.site_settings enable row level security;

-- Anyone (anon + authenticated) can READ settings (the site needs the
-- shrinkme_token on the public homepage to build short links).
drop policy if exists "site_settings_read_all" on public.site_settings;
create policy "site_settings_read_all"
  on public.site_settings
  for select
  to anon, authenticated
  using (true);

-- Only authenticated users (admin) can INSERT / UPDATE / DELETE.
-- Adjust this if you have a stricter admin role check.
drop policy if exists "site_settings_write_authenticated" on public.site_settings;
create policy "site_settings_write_authenticated"
  on public.site_settings
  for all
  to authenticated
  using (true)
  with check (true);
