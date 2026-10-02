-- Memo database schema
-- This file is intentionally provider-ready but is NOT connected to the app yet.
-- Run it in Supabase only when we are ready to connect the backend.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null,
  age integer,
  weight_kg numeric(5,2),
  height_cm numeric(5,2),
  goal text not null check (goal in ('lose', 'maintain', 'gain')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  logged_at timestamptz not null default now(),
  source text not null check (source in ('text', 'photo', 'saved')),
  calories_min integer,
  calories_max integer,
  protein_grams numeric(8,2),
  carbs_grams numeric(8,2),
  fat_grams numeric(8,2),
  confidence text check (confidence in ('high', 'medium', 'low')),
  assumptions jsonb not null default '[]'::jsonb,
  saved_meal_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.saved_meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  analysis jsonb not null,
  use_count integer not null default 0,
  last_used_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.meals
  drop constraint if exists meals_saved_meal_id_fkey;

alter table public.meals
  add constraint meals_saved_meal_id_fkey
  foreign key (saved_meal_id) references public.saved_meals(id) on delete set null;

create index if not exists meals_user_id_logged_at_idx
  on public.meals(user_id, logged_at desc);

create index if not exists saved_meals_user_id_idx
  on public.saved_meals(user_id);

alter table public.profiles enable row level security;
alter table public.meals enable row level security;
alter table public.saved_meals enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can read own meals"
  on public.meals for select
  using (auth.uid() = user_id);

create policy "Users can insert own meals"
  on public.meals for insert
  with check (auth.uid() = user_id);

create policy "Users can update own meals"
  on public.meals for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own meals"
  on public.meals for delete
  using (auth.uid() = user_id);

create policy "Users can read own saved meals"
  on public.saved_meals for select
  using (auth.uid() = user_id);

create policy "Users can insert own saved meals"
  on public.saved_meals for insert
  with check (auth.uid() = user_id);

create policy "Users can update own saved meals"
  on public.saved_meals for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own saved meals"
  on public.saved_meals for delete
  using (auth.uid() = user_id);
