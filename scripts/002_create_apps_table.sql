-- =====================================================================
-- apps table
-- Armazena as apps VPN configuráveis pelo admin.
-- Corre este script no Supabase SQL Editor.
-- =====================================================================

create table if not exists public.apps (
  id            text primary key,          -- slug único ex: "http_injector"
  name          text not null,
  description   text not null default '',
  icon          text not null default '🔒', -- emoji
  color         text not null default 'cyan', -- chave de cor: purple | emerald | yellow | cyan | blue | rose | amber | indigo
  display_order integer not null default 0,
  created_at    timestamptz not null default now()
);

alter table public.apps enable row level security;

-- Qualquer utilizador pode ler (site público precisa das apps)
drop policy if exists "apps_read_all" on public.apps;
create policy "apps_read_all"
  on public.apps for select
  to anon, authenticated
  using (true);

-- Só admin (autenticado) pode escrever
drop policy if exists "apps_write_authenticated" on public.apps;
create policy "apps_write_authenticated"
  on public.apps for all
  to authenticated
  using (true) with check (true);

-- Migrar as apps que estavam hardcoded no código
insert into public.apps (id, name, description, icon, color, display_order) values
  ('http_injector', 'HTTP INJECTOR',   'Configurações para HTTP Injector. Importa o ficheiro .ehi directamente na app.', '🚀', 'purple',  1),
  ('bd_net',        'BD NET',          'Configurações para BD Net. Ficheiros prontos para importar na aplicação.',        '🌐', 'emerald', 2),
  ('apna_tunnel',   'APNA TUNNEL LITE','Configurações para APNA Tunnel Lite. Rápido e fácil de configurar.',             '⚡', 'yellow',  3),
  ('maya_tun',      'MAYA TUN PRO',    'Configurações para Maya Tun Pro. Alta velocidade e estabilidade.',               '🌀', 'cyan',    4)
on conflict (id) do nothing;
