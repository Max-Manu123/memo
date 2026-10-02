-- Memo — production-ready database foundation
-- Provider: Supabase PostgreSQL
-- This schema is prepared now and should only be executed when the
-- Supabase project is ready to be connected to the application.
--
-- Design goals:
-- 1. Every user-owned record is isolated with Row Level Security.
-- 2. Profiles contain only app-level preferences and optional body data.
-- 3. Meals preserve the history of what was logged.
-- 4. Saved meals represent reusable meals that make repeated logging faster.
-- 5. Nutrition estimates remain explicitly estimates, with confidence and assumptions.
-- 6. The schema is intentionally small enough for validation and extensible later.

create extension if not exists "pgcrypto";

-- ============================================================
-- Profiles
-- One application profile per authenticated Supabase user.
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null check (char_length(trim(first_name)) between 2 and 80),
  age smallint check (age is null or age between 13 and 100),
  weight_kg numeric(5,2) check (weight_kg is null or weight_kg between 30 and 300),
  height_cm numeric(5,2) check (height_cm is null or height_cm between 100 and 230),
  goal text not null default 'maintain'
    check (goal in ('lose', 'maintain', 'gain')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- Saved meals
-- Reusable meals learned from the user's repeated/corrected entries.
-- ============================================================
create table if not exists public.saved_meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 160),

  -- Snapshot of the nutrition estimate associated with this reusable meal.
  analysis jsonb not null default '{}'::jsonb,

  use_count integer not null default 0 check (use_count >= 0),
  last_used_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- Meal log
-- Immutable-ish history of each time the user logged a meal.
-- ============================================================
create table if not exists public.meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  name text not null check (char_length(trim(name)) between 1 and 160),
  logged_at timestamptz not null default now(),

  source text not null
    check (source in ('text', 'photo', 'saved')),

  -- Nutrition is represented as a range because estimates are not exact.
  calories_min integer check (calories_min is null or calories_min >= 0),
  calories_max integer check (calories_max is null or calories_max >= 0),
  protein_grams numeric(8,2) check (protein_grams is null or protein_grams >= 0),
  carbs_grams numeric(8,2) check (carbs_grams is null or carbs_grams >= 0),
  fat_grams numeric(8,2) check (fat_grams is null or fat_grams >= 0),

  confidence text
    check (confidence is null or confidence in ('high', 'medium', 'low')),

  -- Keeps the model's uncertainty/context without forcing a rigid schema.
  assumptions jsonb not null default '[]'::jsonb,

  -- Present when this log was created from a reusable meal.
  saved_meal_id uuid references public.saved_meals(id) on delete set null,

  created_at timestamptz not null default now(),

  constraint meals_calorie_range_valid
    check (
      calories_min is null
      or calories_max is null
      or calories_min <= calories_max
    )
);

-- ============================================================
-- Indexes
-- ============================================================
create index if not exists meals_user_logged_at_idx
  on public.meals(user_id, logged_at desc);

create index if not exists meals_user_saved_meal_idx
  on public.meals(user_id, saved_meal_id);

create index if not exists saved_meals_user_updated_at_idx
  on public.saved_meals(user_id, updated_at desc);

-- ============================================================
-- Row Level Security
-- Users can only access their own application data.
-- ============================================================
alter table public.profiles enable row level security;
alter table public.meals enable row level security;
alter table public.saved_meals enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can read own meals" on public.meals;
drop policy if exists "Users can insert own meals" on public.meals;
drop policy if exists "Users can update own meals" on public.meals;
drop policy if exists "Users can delete own meals" on public.meals;
drop policy if exists "Users can read own saved meals" on public.saved_meals;
drop policy if exists "Users can insert own saved meals" on public.saved_meals;
drop policy if exists "Users can update own saved meals" on public.saved_meals;
drop policy if exists "Users can delete own saved meals" on public.saved_meals;

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

-- ============================================================
-- Updated-at trigger
-- ============================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists saved_meals_set_updated_at on public.saved_meals;
create trigger saved_meals_set_updated_at
before update on public.saved_meals
for each row execute function public.set_updated_at();

-- ============================================================
-- Authentication/profile bootstrap
-- Creates an empty profile automatically when a new auth user is created.
-- The application should complete first_name/goal during onboarding.
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, goal)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'first_name'), ''), 'Usuário'),
    coalesce(nullif(new.raw_user_meta_data ->> 'goal', ''), 'maintain')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
