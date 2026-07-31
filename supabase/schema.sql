-- SignBridge AI Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  full_name text,
  avatar_url text,
  xp integer default 0,
  level integer default 1,
  coins integer default 0,
  streak integer default 0,
  last_activity text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Lesson progress table
create table if not exists public.lesson_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  lesson_id text not null,
  completed boolean default false,
  score integer,
  time_spent integer,
  completed_at timestamptz,
  created_at timestamptz default now(),
  unique(user_id, lesson_id)
);

-- Practice sessions table
create table if not exists public.practice_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  sign_id text not null,
  accuracy integer not null,
  duration integer default 0,
  created_at timestamptz default now()
);

-- Quiz results table
create table if not exists public.quiz_results (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  quiz_id text not null,
  score integer not null,
  xp_earned integer default 0,
  completed_at timestamptz default now()
);

-- Achievements table
create table if not exists public.achievements (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  achievement_id text not null,
  earned_at timestamptz default now(),
  unique(user_id, achievement_id)
);

-- Leaderboards view
create or replace view public.leaderboards as
  select
    p.id as user_id,
    p.username,
    p.full_name,
    p.avatar_url,
    p.xp,
    p.level,
    p.streak,
    rank() over (order by p.xp desc) as rank
  from public.profiles p;

-- Activity logs
create table if not exists public.activity_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  action text not null,
  metadata jsonb,
  created_at timestamptz default now()
);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.practice_sessions enable row level security;
alter table public.quiz_results enable row level security;
alter table public.achievements enable row level security;
alter table public.activity_logs enable row level security;

-- Profiles RLS
create policy "Users can view their own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Public profiles are viewable by all" on public.profiles
  for select using (true);

-- Lesson progress RLS  
create policy "Users can manage their own progress" on public.lesson_progress
  for all using (auth.uid() = user_id);

-- Practice sessions RLS
create policy "Users can manage their own practice" on public.practice_sessions
  for all using (auth.uid() = user_id);

-- Quiz results RLS
create policy "Users can manage their own quiz results" on public.quiz_results
  for all using (auth.uid() = user_id);

-- Achievements RLS
create policy "Users can view their own achievements" on public.achievements
  for all using (auth.uid() = user_id);

-- Activity logs RLS
create policy "Users can manage their activity" on public.activity_logs
  for all using (auth.uid() = user_id);

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, username)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    split_part(new.email, '@', 1)
  );
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
