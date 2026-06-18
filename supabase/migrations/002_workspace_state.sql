-- Mari Phase 4c: cloud workspace sync (JSON snapshot per user)
-- Run in Supabase Dashboard → SQL Editor after 001_profiles.sql

create table if not exists public.workspace_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists workspace_state_updated_at_idx
  on public.workspace_state (updated_at);

alter table public.workspace_state enable row level security;

drop policy if exists "Users read own workspace" on public.workspace_state;
create policy "Users read own workspace"
  on public.workspace_state
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users insert own workspace" on public.workspace_state;
create policy "Users insert own workspace"
  on public.workspace_state
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users update own workspace" on public.workspace_state;
create policy "Users update own workspace"
  on public.workspace_state
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
