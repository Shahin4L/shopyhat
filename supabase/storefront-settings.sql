-- Apply in Supabase SQL Editor before using the storefront studio.
create table if not exists public.sh_storefront_settings (
  id text primary key default 'primary' check (id='primary'),
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by text
);
insert into public.sh_storefront_settings(id,settings) values ('primary','{}'::jsonb) on conflict(id) do nothing;
alter table public.sh_storefront_settings enable row level security;
revoke all on public.sh_storefront_settings from anon, authenticated;
grant select on public.sh_storefront_settings to anon, authenticated;
grant insert, update on public.sh_storefront_settings to authenticated;
drop policy if exists "Public storefront settings read" on public.sh_storefront_settings;
create policy "Public storefront settings read" on public.sh_storefront_settings for select to anon, authenticated using (true);
drop policy if exists "Only authorized studio managers edit storefront" on public.sh_storefront_settings;
create policy "Only authorized studio managers edit storefront" on public.sh_storefront_settings for all to authenticated
using (exists(select 1 from public.sh_staff s where lower(s.email)=lower(auth.jwt()->>'email') and s.active=true and s.role in ('owner','manager')))
with check (exists(select 1 from public.sh_staff s where lower(s.email)=lower(auth.jwt()->>'email') and s.active=true and s.role in ('owner','manager')));
