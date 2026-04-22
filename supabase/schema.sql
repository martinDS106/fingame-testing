-- ============================================================================
-- Fin-Game — Supabase Schema
-- Run this once in the Supabase SQL Editor to create tables + RLS policies.
-- ============================================================================

-- Profiles mirror auth.users with our app-specific fields.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Player',
  avatar text default '👤',
  level text not null default 'Beginner',
  is_admin boolean not null default false,
  coins integer not null default 100,
  xp integer not null default 0,
  streak integer not null default 0,
  longest_streak integer not null default 0,
  last_active_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Coin ledger — source of truth for coin changes.
create table if not exists public.coins_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null,
  reason text not null,
  created_at timestamptz not null default now()
);

-- Progress per course / simulation.
create table if not exists public.user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('course','simulation','lesson','quiz','video')),
  ref_id text not null,
  progress numeric not null default 0,
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (user_id, kind, ref_id)
);

-- Old databases may have been created before `video` progress existed. `create
-- table if not exists` does not alter an existing table, so normalize the
-- check constraint here (idempotent when already including `video`).
alter table public.user_progress
  drop constraint if exists user_progress_kind_check;

alter table public.user_progress
  add constraint user_progress_kind_check
  check (kind in ('course','simulation','lesson','quiz','video'));

-- Reward redemptions from marketplace.
create table if not exists public.redemptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reward_id text not null,
  reward_title text not null,
  cost integer not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

-- Helpful indexes
create index if not exists idx_coins_log_user on public.coins_log(user_id, created_at desc);
create index if not exists idx_progress_user on public.user_progress(user_id);
create index if not exists idx_redemptions_user on public.redemptions(user_id, created_at desc);

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.coins_log enable row level security;
alter table public.user_progress enable row level security;
alter table public.redemptions enable row level security;

-- Profiles: users can read/update only their own row.
drop policy if exists "profiles_self_select" on public.profiles;
create policy "profiles_self_select" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_self_upsert" on public.profiles;
create policy "profiles_self_upsert" on public.profiles
  for insert with check (auth.uid() = id and is_admin = false);

drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update" on public.profiles
  for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and is_admin = (
      select p.is_admin from public.profiles p where p.id = auth.uid()
    )
  );

-- Admin: read/update profiles (incl. is_admin) for moderation/ops.
drop policy if exists "profiles_admin_select" on public.profiles;
create policy "profiles_admin_select" on public.profiles
  for select using (public.is_admin());

drop policy if exists "profiles_admin_update" on public.profiles;
create policy "profiles_admin_update" on public.profiles
  for update using (public.is_admin())
  with check (public.is_admin());

-- ============================================================================
-- Leaderboard (public top-10)
-- NOTE: profiles table is private by RLS (self-only). This RPC exposes only the
-- minimal fields needed for a global leaderboard.
-- ============================================================================
create or replace function public.leaderboard_top(p_limit int default 10)
returns table (
  user_id uuid,
  display_name text,
  avatar text,
  coins int,
  xp int,
  streak int
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id as user_id,
    p.display_name,
    coalesce(p.avatar, '👤') as avatar,
    p.coins,
    p.xp,
    p.streak
  from public.profiles p
  order by p.coins desc, p.xp desc, p.updated_at desc
  limit greatest(1, least(p_limit, 100));
$$;

grant execute on function public.leaderboard_top(int) to anon, authenticated;

-- ============================================================================
-- Admin analytics stats (for dashboard)
-- ============================================================================
create or replace function public.admin_dashboard_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  out jsonb;
begin
  if not public.is_admin() then
    raise exception 'admin only';
  end if;

  out := jsonb_build_object(
    'users_total', (select count(*) from public.profiles),
    'users_active_7d', (
      select count(*)
      from public.profiles
      where last_active_date is not null
        and last_active_date >= (current_date - interval '7 days')::date
    ),
    'coins_total', (select coalesce(sum(coins), 0) from public.profiles),
    'xp_total', (select coalesce(sum(xp), 0) from public.profiles),
    'quiz_attempts_total', (select count(*) from public.quiz_attempts),
    'redemptions_total', (select count(*) from public.redemptions),
    'redemptions_pending', (select count(*) from public.redemptions where status = 'pending'),
    'redemptions_fulfilled', (select count(*) from public.redemptions where status = 'fulfilled'),
    'redemptions_rejected', (select count(*) from public.redemptions where status = 'rejected')
  );

  return out;
end;
$$;

grant execute on function public.admin_dashboard_stats() to authenticated;

-- Helper: admin check (RLS-friendly)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- Coins log: users can read their own + insert their own.
drop policy if exists "coins_log_self_select" on public.coins_log;
create policy "coins_log_self_select" on public.coins_log
  for select using (auth.uid() = user_id);

drop policy if exists "coins_log_self_insert" on public.coins_log;
create policy "coins_log_self_insert" on public.coins_log
  for insert with check (auth.uid() = user_id);

-- Progress: users read/write their own.
drop policy if exists "progress_self_all" on public.user_progress;
create policy "progress_self_all" on public.user_progress
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Redemptions: users read/write their own.
drop policy if exists "redemptions_self_all" on public.redemptions;
create policy "redemptions_self_all" on public.redemptions
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Redemptions: admin can review/update all rows.
drop policy if exists "redemptions_admin_all" on public.redemptions;
create policy "redemptions_admin_all" on public.redemptions
  for all using (public.is_admin())
  with check (public.is_admin());

-- ============================================================================
-- Trigger: auto-create profile row when auth.users row is inserted.
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', 'Player')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================================
-- Learning Content — courses, lessons, videos (public read, admin write)
-- ============================================================================
create table if not exists public.courses (
  id text primary key,
  title text not null,
  title_ar text,
  description text,
  description_ar text,
  topic text not null default 'investing',
  icon text default '📚',
  color text default '#2563eb',
  sort_order integer not null default 0,
  coin_reward integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.lessons (
  id text primary key,
  course_id text not null references public.courses(id) on delete cascade,
  title text not null,
  title_ar text,
  summary text,
  summary_ar text,
  duration_minutes integer not null default 10,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.videos (
  id text primary key,
  lesson_id text not null references public.lessons(id) on delete cascade,
  title text not null,
  title_ar text,
  url text not null,
  thumbnail text,
  duration_seconds integer not null default 0,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Backfill columns for existing projects (safe to run repeatedly)
alter table public.courses add column if not exists title_ar text;
alter table public.courses add column if not exists description_ar text;
alter table public.courses add column if not exists topic text not null default 'investing';

alter table public.lessons add column if not exists title_ar text;
alter table public.lessons add column if not exists summary_ar text;

alter table public.videos add column if not exists title_ar text;

alter table public.quizzes add column if not exists title_ar text;
alter table public.quizzes add column if not exists description_ar text;

alter table public.questions add column if not exists question_ar text;
alter table public.questions add column if not exists options_ar jsonb;
alter table public.questions add column if not exists explanation_ar text;

create index if not exists idx_lessons_course on public.lessons(course_id, sort_order);
create index if not exists idx_videos_lesson on public.videos(lesson_id, sort_order);

alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.videos enable row level security;

drop policy if exists "courses_public_read" on public.courses;
create policy "courses_public_read" on public.courses for select using (true);

drop policy if exists "lessons_public_read" on public.lessons;
create policy "lessons_public_read" on public.lessons for select using (true);

drop policy if exists "videos_public_read" on public.videos;
create policy "videos_public_read" on public.videos for select using (true);

-- ============================================================================
-- Quizzes — quizzes, questions, attempts
-- ============================================================================
create table if not exists public.quizzes (
  id text primary key,
  title text not null,
  title_ar text,
  description text,
  description_ar text,
  category text not null default 'general',
  difficulty text not null default 'easy' check (difficulty in ('easy','medium','hard')),
  coin_reward integer not null default 10,
  created_at timestamptz not null default now()
);

create table if not exists public.questions (
  id text primary key,
  quiz_id text not null references public.quizzes(id) on delete cascade,
  question text not null,
  question_ar text,
  options jsonb not null,
  options_ar jsonb,
  correct_index integer not null,
  explanation text,
  explanation_ar text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  quiz_id text not null references public.quizzes(id) on delete cascade,
  score integer not null,
  total integer not null,
  coins_earned integer not null default 0,
  completed_at timestamptz not null default now()
);

create index if not exists idx_questions_quiz on public.questions(quiz_id, sort_order);
create index if not exists idx_attempts_user on public.quiz_attempts(user_id, completed_at desc);

alter table public.quizzes enable row level security;
alter table public.questions enable row level security;
alter table public.quiz_attempts enable row level security;

drop policy if exists "quizzes_public_read" on public.quizzes;
create policy "quizzes_public_read" on public.quizzes for select using (true);

drop policy if exists "questions_public_read" on public.questions;
create policy "questions_public_read" on public.questions for select using (true);

drop policy if exists "attempts_self_all" on public.quiz_attempts;
create policy "attempts_self_all" on public.quiz_attempts
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================================
-- Marketplace products (public read; admin write later)
-- ============================================================================
create table if not exists public.marketplace_products (
  id text primary key,
  category text not null default 'credit-cards',
  bank text not null,
  logo text not null default '🏦',
  name text not null,
  apr numeric not null default 0,
  annual_fee numeric not null default 0,
  cashback numeric not null default 0,
  rating numeric not null default 0,
  reviews_count integer not null default 0,
  tier text not null default 'moderate' check (tier in ('strong','moderate','high')),
  min_income integer not null default 0,
  min_age integer,
  min_credit_score integer,
  benefits jsonb not null default '[]'::jsonb,
  pros jsonb not null default '[]'::jsonb,
  cons jsonb not null default '[]'::jsonb,
  best_for text not null default '',
  is_best_value boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_marketplace_products_category
  on public.marketplace_products(category, sort_order);

alter table public.marketplace_products enable row level security;

drop policy if exists "marketplace_products_public_read" on public.marketplace_products;
create policy "marketplace_products_public_read"
  on public.marketplace_products
  for select using (true);

drop policy if exists "marketplace_products_admin_write" on public.marketplace_products;
create policy "marketplace_products_admin_write"
  on public.marketplace_products
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- Learning content: admin write
drop policy if exists "courses_admin_write" on public.courses;
create policy "courses_admin_write" on public.courses
  for all using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "lessons_admin_write" on public.lessons;
create policy "lessons_admin_write" on public.lessons
  for all using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "videos_admin_write" on public.videos;
create policy "videos_admin_write" on public.videos
  for all using (public.is_admin())
  with check (public.is_admin());

-- Quizzes: admin write
drop policy if exists "quizzes_admin_write" on public.quizzes;
create policy "quizzes_admin_write" on public.quizzes
  for all using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "questions_admin_write" on public.questions;
create policy "questions_admin_write" on public.questions
  for all using (public.is_admin())
  with check (public.is_admin());

-- ============================================================================
-- Banking transactions
-- ============================================================================
-- ============================================================================
-- FinTok — curated short videos (public read, admin write)
-- Uses Supabase Storage bucket: `fintok` (public read, admin write).
-- ============================================================================
create table if not exists public.fintok_videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  title_ar text,
  creator_name text not null default 'Fin Educator',
  creator_name_ar text,
  creator_avatar text not null default '👨‍🏫',
  caption text,
  caption_ar text,
  tags jsonb not null default '[]'::jsonb,
  simulation_route text, -- e.g. /simulation/banking
  storage_bucket text not null default 'fintok',
  storage_path text not null, -- path within bucket, e.g. videos/xyz.mp4
  video_url text, -- optional; if present overrides storage public url
  thumbnail_url text,
  duration_seconds integer not null default 0,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_fintok_videos_published
  on public.fintok_videos(is_published, sort_order, created_at desc);

create table if not exists public.fintok_likes (
  user_id uuid not null references auth.users(id) on delete cascade,
  video_id uuid not null references public.fintok_videos(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, video_id)
);

create table if not exists public.fintok_saves (
  user_id uuid not null references auth.users(id) on delete cascade,
  video_id uuid not null references public.fintok_videos(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, video_id)
);

create table if not exists public.fintok_comments (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references public.fintok_videos(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_fintok_comments_video
  on public.fintok_comments(video_id, created_at desc);

alter table public.fintok_videos enable row level security;
alter table public.fintok_likes enable row level security;
alter table public.fintok_saves enable row level security;
alter table public.fintok_comments enable row level security;

drop policy if exists "fintok_videos_public_read" on public.fintok_videos;
create policy "fintok_videos_public_read" on public.fintok_videos
  for select using (is_published = true);

drop policy if exists "fintok_videos_admin_write" on public.fintok_videos;
create policy "fintok_videos_admin_write" on public.fintok_videos
  for all using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "fintok_likes_self_all" on public.fintok_likes;
create policy "fintok_likes_self_all" on public.fintok_likes
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "fintok_saves_self_all" on public.fintok_saves;
create policy "fintok_saves_self_all" on public.fintok_saves
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "fintok_comments_public_read" on public.fintok_comments;
create policy "fintok_comments_public_read" on public.fintok_comments
  for select using (true);

drop policy if exists "fintok_comments_self_insert" on public.fintok_comments;
create policy "fintok_comments_self_insert" on public.fintok_comments
  for insert with check (auth.uid() = user_id);

drop policy if exists "fintok_comments_admin_delete" on public.fintok_comments;
create policy "fintok_comments_admin_delete" on public.fintok_comments
  for delete using (public.is_admin());

-- Storage bucket for FinTok uploads (idempotent)
insert into storage.buckets (id, name, public)
values ('fintok', 'fintok', true)
on conflict (id) do update set public = excluded.public;

-- Storage policies: public read for the bucket; admin write.
drop policy if exists "fintok_storage_public_read" on storage.objects;
create policy "fintok_storage_public_read"
  on storage.objects
  for select
  using (bucket_id = 'fintok');

drop policy if exists "fintok_storage_admin_write" on storage.objects;
create policy "fintok_storage_admin_write"
  on storage.objects
  for all
  using (bucket_id = 'fintok' and public.is_admin())
  with check (bucket_id = 'fintok' and public.is_admin());

create table if not exists public.banking_transactions (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id text not null,
  amount numeric not null,
  type text not null check (type in ('deposit','withdraw','transfer')),
  category text not null,
  note text,
  at timestamptz not null default now()
);

create index if not exists idx_banking_txn_user on public.banking_transactions(user_id, at desc);

alter table public.banking_transactions enable row level security;

drop policy if exists "banking_txn_self_all" on public.banking_transactions;
create policy "banking_txn_self_all" on public.banking_transactions
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================================
-- Admin: stock prices overrides (optional)
-- ============================================================================
create table if not exists public.stock_prices (
  symbol text primary key,
  price numeric not null,
  updated_at timestamptz not null default now()
);

alter table public.stock_prices enable row level security;

drop policy if exists "stock_prices_public_read" on public.stock_prices;
create policy "stock_prices_public_read" on public.stock_prices
  for select using (true);

drop policy if exists "stock_prices_admin_write" on public.stock_prices;
create policy "stock_prices_admin_write" on public.stock_prices
  for all using (public.is_admin())
  with check (public.is_admin());

-- ============================================================================
-- Investment — holdings (per user/symbol) + trades (ledger)
-- ============================================================================
create table if not exists public.investment_holdings (
  user_id uuid not null references auth.users(id) on delete cascade,
  symbol text not null,
  shares numeric not null,
  avg_cost numeric not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, symbol)
);

create table if not exists public.investment_trades (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  symbol text not null,
  action text not null check (action in ('buy','sell')),
  shares numeric not null,
  price numeric not null,
  at timestamptz not null default now()
);

create index if not exists idx_inv_trades_user on public.investment_trades(user_id, at desc);

alter table public.investment_holdings enable row level security;
alter table public.investment_trades enable row level security;

drop policy if exists "holdings_self_all" on public.investment_holdings;
create policy "holdings_self_all" on public.investment_holdings
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "trades_self_all" on public.investment_trades;
create policy "trades_self_all" on public.investment_trades
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- Manual one-offs (run in SQL Editor as needed; do not hard-code real user ids
-- in version-controlled SQL).
-- -----------------------------------------------------------------------------
-- Promote your account to admin (replace with your auth user uuid):
--   update public.profiles set is_admin = true where id = '<uuid>';
