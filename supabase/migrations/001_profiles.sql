-- Mari Phase 3: profiles table for plan + AI usage tracking
-- Run in Supabase Dashboard → SQL Editor (or via Supabase CLI)

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  ai_imports_used integer not null default 0 check (ai_imports_used >= 0),
  ai_imports_period text not null default to_char(now(), 'YYYY-MM'),
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

-- Plan changes only via service role (webhooks) — no client update policy

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, plan, ai_imports_used, ai_imports_period)
  values (new.id, 'free', 0, to_char(now(), 'YYYY-MM'))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Backfill existing auth users (safe to re-run)
insert into public.profiles (id, plan, ai_imports_used, ai_imports_period)
select id, 'free', 0, to_char(now(), 'YYYY-MM')
from auth.users
on conflict (id) do nothing;
