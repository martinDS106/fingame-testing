## Supabase → NestJS + MySQL Migration Phases (Tracking)

Goal: keep the current Supabase MVP working, while building a parallel **NestJS + MySQL** backend and migrating feature-by-feature with clear checkpoints.

---

### Phase 0 — Decisions & Setup (Foundations)
- **Deliverables**
  - Confirm backend stack: **NestJS + MySQL**.
  - Decide ORM: **Prisma** (recommended) or TypeORM.
  - Decide storage: S3/MinIO vs local filesystem.
  - Decide hosting: local Docker for dev + target environment for staging/prod.
- **Done when**
  - Decisions documented + environment variables agreed (DB, JWT, storage, base URL).

---

### Phase 1 — Backend Skeleton (Running Service)
- **Deliverables**
  - `backend/` NestJS project boots locally.
  - Swagger enabled (API docs).
  - `/health` endpoint.
  - Docker compose for MySQL (local dev).
  - Prisma schema connected to MySQL + first migration works.
- **Done when**
  - Running: `docker compose up` + `npm run start:dev` and `/health` returns 200.

---

### Phase 2 — Auth (Replacement for Supabase Auth)
- **Deliverables**
  - Users table (email, password hash, created_at, etc.).
  - Signup / Login endpoints.
  - JWT access + refresh token flow.
  - Password reset (email flow or token-based; depends on mail provider).
  - Role support (admin flag).
- **Done when**
  - Mobile can create account + login via API (even if rest is still Supabase).

---

### Phase 3 — Content Read APIs (Courses/Lessons/Videos/Quizzes)
- **Deliverables**
  - MySQL schema for content:
    - courses, lessons, videos, quizzes, questions
    - localization fields (EN + AR)
    - course topic (Saving/Investing/Budgeting)
  - Public read endpoints:
    - list courses + filters
    - course details (lessons, videos)
    - quizzes list + quiz details
- **Done when**
  - Mobile can load Courses + Quizzes from API with parity to Supabase.

---

### Phase 4 — Progress & Points (User State)
- **Deliverables**
  - Progress tables (course/lesson/quiz/video progress).
  - Awarding points/xp/coins rules (same as current MVP).
  - Endpoints for:
    - marking completion
    - reading user progress
    - updating balances
- **Done when**
  - Completing a quiz/video updates points and persists in MySQL.

---

### Phase 5 — Leaderboard + Analytics
- **Deliverables**
  - Leaderboard endpoint (top 10) based on points/xp.
  - Admin analytics endpoints (basic stats).
- **Done when**
  - Leaderboard screen loads from MySQL API and matches expected ranking.

---

### Phase 6 — Investment Simulator Backend (Stock Overrides)
- **Deliverables**
  - Stock prices table + admin override endpoints.
  - (Optional) Trades/holdings persistence on backend if desired.
- **Done when**
  - Admin override price reflects in simulator after refresh/tick.

---

### Phase 7 — Admin Dashboard APIs (CRUD)
- **Deliverables**
  - Admin-only CRUD endpoints for:
    - courses/lessons/videos
    - quizzes/questions
    - users (read/update)
    - redemptions (if used)
  - Authorization guards/roles enforcement (admin only).
- **Done when**
  - Admin app screens can edit/create content through MySQL API.

---

### Phase 8 — File Uploads (Avatars / Videos)
- **Deliverables**
  - Upload API for profile avatars.
  - Upload API for learning videos (if required).
  - Storage integration (S3/MinIO/local) + public URL strategy.
- **Done when**
  - Upload from admin/profile works end-to-end and assets are accessible.

---

### Phase 9 — Mobile Switch (Feature Flag + Gradual Cutover)
- **Deliverables**
  - Add `EXPO_PUBLIC_API_BASE_URL` to the app.
  - Implement `apiClient` + new service layer (parallel to Supabase).
  - Feature flag to choose data source:
    - Supabase (current)
    - MySQL API (new)
  - Migrate screens gradually (Auth → Content → Progress → Admin).
- **Done when**
  - App can run fully with **MySQL API** without using Supabase.

---

### Phase 10 — Migration & Launch Readiness
- **Deliverables**
  - Data migration plan (seed initial content into MySQL).
  - QA pass for parity (all BRD MVP flows).
  - Deployment plan (staging/prod environments).
- **Done when**
  - MySQL backend is production-ready and Supabase can be retired (if desired).

---

## Status Template (fill as we go)
- Phase 0: Not started / In progress / Done
- Phase 1: Not started / In progress / Done
- Phase 2: Not started / In progress / Done
- Phase 3: Not started / In progress / Done
- Phase 4: Not started / In progress / Done
- Phase 5: Not started / In progress / Done
- Phase 6: Not started / In progress / Done
- Phase 7: Not started / In progress / Done
- Phase 8: Not started / In progress / Done
- Phase 9: Not started / In progress / Done
- Phase 10: Not started / In progress / Done

