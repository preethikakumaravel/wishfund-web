-- WishFund database schema for Supabase.
-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- It is safe to re-run: everything is created with "if not exists" / "or replace".

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

-- One row per signed-up user. Created automatically by a trigger on auth.users.
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text not null,
  display_name text check (char_length(display_name) <= 60),
  role text not null default 'user' check (role in ('user', 'admin')),
  status text not null default 'active' check (status in ('active', 'blocked')),
  created_at timestamptz not null default now(),
  last_seen_at timestamptz
);

-- Each user's wishlist, months and settings, stored as one JSON document.
-- Only the owner can read or write it; admins cannot see it.
create table if not exists public.user_data (
  user_id uuid primary key references public.profiles on delete cascade,
  state jsonb not null,
  updated_at timestamptz not null default now()
);

-- Notices the admin shows to every signed-in user.
create table if not exists public.announcements (
  id bigint generated always as identity primary key,
  message text not null check (char_length(message) between 1 and 500),
  active boolean not null default true,
  created_by uuid references public.profiles on delete set null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Helper functions (security definer so policies can call them without recursion)
-- ---------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and status = 'active'
  );
$$;

create or replace function public.is_active_user()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and status = 'active'
  );
$$;

-- Create a profile whenever someone signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Users may edit their own display name, but only admins may change role or status.
create or replace function public.guard_profile_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- No signed-in user means the SQL editor / service role: allow (used to make the first admin).
  if auth.uid() is null then
    return new;
  end if;

  if new.id <> old.id or new.email <> old.email or new.created_at <> old.created_at then
    raise exception 'These profile fields cannot be changed';
  end if;

  if (new.role <> old.role or new.status <> old.status) then
    if not public.is_admin() then
      raise exception 'Only admins can change role or status';
    end if;
    if old.id = auth.uid() then
      raise exception 'Admins cannot change their own role or status';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists guard_profile_update on public.profiles;
create trigger guard_profile_update
  before update on public.profiles
  for each row execute function public.guard_profile_update();

-- Admin-only: permanently delete a user's account and all their data.
create or replace function public.admin_delete_user(target uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Only admins can delete users';
  end if;
  if target = auth.uid() then
    raise exception 'Admins cannot delete themselves';
  end if;
  delete from auth.users where id = target;
end;
$$;

revoke execute on function public.admin_delete_user(uuid) from public, anon;
grant execute on function public.admin_delete_user(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.user_data enable row level security;
alter table public.announcements enable row level security;

drop policy if exists "profiles: read own or admin" on public.profiles;
create policy "profiles: read own or admin" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles: update own or admin" on public.profiles;
create policy "profiles: update own or admin" on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

drop policy if exists "user_data: owner only" on public.user_data;
create policy "user_data: owner only" on public.user_data
  for all to authenticated
  using (user_id = auth.uid() and public.is_active_user())
  with check (user_id = auth.uid() and public.is_active_user());

drop policy if exists "announcements: read" on public.announcements;
create policy "announcements: read" on public.announcements
  for select to authenticated
  using (active or public.is_admin());

drop policy if exists "announcements: admin write" on public.announcements;
create policy "announcements: admin write" on public.announcements
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Make yourself admin (run after you have signed up on the website once).
-- Replace the email, then run just this line:
--
--   update public.profiles set role = 'admin' where email = 'you@example.com';
-- ---------------------------------------------------------------------------
