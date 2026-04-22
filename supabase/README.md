# Supabase Setup

This folder contains the schema + setup steps to wire Fin-Game to a Supabase backend.

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → New project
2. Pick a region close to Egypt (e.g. `eu-central-1`)
3. Copy the **Project URL** and **anon public key** from Project Settings → API

## 2. Add env variables

Create `.env` in the project root (same folder as `package.json`):

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

> Expo auto-loads `.env` at build time. Restart Metro after editing.

## 3. Run the schema

Open Supabase Studio → **SQL Editor** → paste the contents of
[`schema.sql`](./schema.sql) → **Run**.

This creates:

- `profiles` — user game state (coins, XP, streak, level)
- `coins_log` — append-only ledger of coin changes
- `user_progress` — per-course / per-simulation progress
- `redemptions` — marketplace redemption history
- `courses`, `lessons`, `videos` — learning content (public read)
- `quizzes`, `questions`, `quiz_attempts` — quiz bank + user attempts
- `banking_transactions` — per-user bank transactions ledger
- `investment_holdings`, `investment_trades` — portfolio state + trade ledger

RLS is enabled so every user can only read/write their own rows (content tables
are public-read only).

## 3b. Seed content

After schema, run [`seeds.sql`](./seeds.sql) the same way (SQL Editor → paste → Run).

This inserts:

- 5 courses (Investing, Budgeting, EGX, Credit, Gold)
- 15 lessons across all courses
- 5 quizzes with **50 questions total**, each with explanation

Safe to re-run (uses `ON CONFLICT` upserts).

## 4. Enable email auth

In Supabase Studio → **Authentication → Providers → Email**:

- Enable **Email** provider
- For dev: uncheck **Confirm email** (so signup is instant) — re-enable before prod.

## 5. Test

Restart Metro (`npm run start:clean`) and open the app. You should see the
login screen on first launch. Signups will create a row in `auth.users` and
trigger `profiles` creation automatically.

## Data sync model

The app is offline-first: every user action writes to Zustand + AsyncStorage
immediately, then fires a background push to Supabase via `lib/syncService.ts`.

Current bindings:

- **Profile / coins / XP / streak** — auto-pushed on every change (`useUserStore`)
- **Banking transactions** — pushed on `deposit/withdraw/transfer` (`useBankingStore`)
- **Investment trades + holdings** — pushed on `buy/sell`; holding row is deleted
  when shares hit 0 (`useInvestmentStore`)
- **Lesson completion + quiz attempts** — `user_progress` + `quiz_attempts`
  (`useContentStore`)
- **Courses / lessons / quizzes / questions** — pulled on app boot, cached locally
  with fallback seeds so the app works even when Supabase is unreachable
