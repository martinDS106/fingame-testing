# 📘 Fin-Game Guidelines

This document is the lightweight “source of truth” for how we build Fin-Game.
It’s meant to keep the codebase consistent as features grow.

---

## 🧭 Product Principles

- **Mobile-first**: designed for small screens, thumb-friendly interactions.
- **Fast feedback**: loading states, optimistic UI where safe, clear errors.
- **Offline-tolerant**: app should keep working if Supabase is not configured or network is down.
- **Learning-first**: simulations and content should explain “why”, not only “what”.

---

## 🧱 Architecture & Conventions

### Routing (Expo Router)

- Screens live in `app/` (file-based routes).
- Prefer **simple routes** and shared UI in `components/`.
- Keep route files focused on UI composition; move logic to `stores/`, `lib/`, and `hooks/`.

### State (Zustand)

- Stores live in `stores/`.
- Prefer small, focused stores per domain (`useUserStore`, `useInvestmentStore`, …).
- Persist only what must survive restarts (use `partialize` where appropriate).

### UI & Styling

- Use NativeWind classNames for layout and typography; keep inline styles for dynamic values only.
- Reuse shared components: `components/ui/*`, `ScreenHeader`, `BottomNav`, `Card`, `Button`, `Badge`.
- Avoid duplicated UI patterns: if reused twice, extract a component.

---

## ☁️ Supabase & Sync Rules

### Offline mode (must)

- Every sync function must be **safe to call** when Supabase isn’t configured.
- Use the existing pattern: `if (!isSupabaseConfigured) return ...`.
- Never crash the app due to network/auth failures; log and degrade gracefully.

### Data ownership

- **Canonical remote fields** (coins/xp/streak/profile) are owned by Supabase when logged in.
- Local state is authoritative only in guest/offline mode.

### RLS

- Use RLS for all tables.
- Public read is allowed **only** for truly public content (courses, videos, marketplace products).
- User-specific data should always be scoped by `auth.uid()`.

### Seeds & Schema

- `supabase/schema.sql`: tables + indexes + RLS + triggers.
- `supabase/seeds.sql`: initial content (safe to re-run using `on conflict`).

---

## 🌍 i18n / RTL Guidelines

- All user-facing strings should gradually move to `lib/i18n.ts` keys.
- Arabic must support RTL:
  - `I18nManager.forceRTL` is triggered by locale changes.
  - When switching RTL/LTR, inform user a restart may be required.
- Avoid hard-coded left/right in styles; prefer logical layout using flex and spacing.

---

## ✅ “Definition of Done”

Before marking an item as done:

- Feature works in **guest mode** and **authenticated mode** (if relevant).
- UI has loading/empty/error states where a network call exists.
- No TypeScript errors and no obvious runtime warnings.
- For sync features: verify “remote source” by changing remote data and seeing it reflect in-app.

