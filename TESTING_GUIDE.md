## Fin‑Game MVP – QA Testing Guide

This document is intended for **manual QA** of the Fin‑Game MVP. It provides a structured walkthrough, expected outcomes, and a standard template for reporting issues.

---

## Project links
- **Android APK (internal distribution)**: `https://expo.dev/accounts/martinash/projects/fin-game/builds/60fcdf2c-3fd4-4ba8-bed7-dadca04c0b16`
- **Supabase (backend base URL)**: `https://glwqopjorysuxajokqsz.supabase.co`

---

## Preconditions
- **Database**: Supabase must have `supabase/schema.sql` applied, then `supabase/seeds.sql` applied (Supabase SQL Editor).
- **Device**: Android device (recommended) with stable internet connection.
- **Accounts**:
  - Create at least **one regular user** (email/password).
  - For admin verification, use an account that has `profiles.is_admin = true`.

---

## Scope
- **In scope**:
  - Auth (Signup/Login/Logout/Password reset)
  - Localization (Arabic/English + RTL)
  - Courses/Lessons/Videos
  - Quizzes
  - Points/XP/Coins updates where applicable
  - Leaderboard
  - Investment simulator (EGP 100,000 start; buy/sell; P&L)
  - Notifications inbox navigation
  - Edit profile avatar upload/display
  - Admin dashboard flows (content management + analytics + stock overrides)
- **Out of scope** (unless explicitly requested):
  - Automated tests
  - App Store / Play Store publishing steps

---

## Smoke checklist (quick pass)
Use this first to confirm the build is correctly connected to Supabase.

- [ ] Welcome screen shows **Get started** and **Have an account?**
- [ ] Signup works (new user can enter the app)
- [ ] Login works (existing user can enter the app)
- [ ] Courses list loads (not empty)
- [ ] A quiz opens and can be completed (no red error screen)
- [ ] Leaderboard loads (top users visible)

If any of the above fails, see **Troubleshooting** before continuing.

---

## Test cases (step‑by‑step)

### TC‑01: Install & First Launch
**Steps**
1. Install the APK on Android.
2. Launch the app.

**Expected**
- Welcome screen renders with:
  - **Get started** (Signup)
  - **Have an account?** (Login)
  - Optional: **Continue as guest**
- If Supabase is correctly configured in the build, **Login/Signup options are available**.

---

### TC‑02: Signup (Create Account)
**Steps**
1. Tap **Get started**.
2. Create a new account with email/password.

**Expected**
- User is authenticated and navigates to the main app.
- User profile is created/available in Supabase.

---

### TC‑03: Login / Logout
**Steps**
1. Tap **Have an account?**.
2. Login using your credentials.
3. Navigate to Profile/Settings and logout (if available).

**Expected**
- Login succeeds and navigates into the app.
- Logout returns to an unauthenticated state.

---

### TC‑04: Password Reset
**Steps**
1. Open Login.
2. Tap **Forgot password?**
3. Enter your email and submit.

**Expected**
- Confirmation message appears (email sent).
- User receives a reset email (depends on Supabase email configuration).

---

### TC‑05: Language (Arabic / English) + RTL
**Steps**
1. Go to Settings.
2. Switch language to Arabic (if available).

**Expected**
- UI strings update to Arabic.
- Layout switches to RTL.
- Localized content (Arabic titles/descriptions/options) appears where present.

---

### TC‑06: Courses (List → Details → Lesson → Video)
**Steps**
1. Open **Courses**.
2. Apply topic filter (All / Saving / Investing / Budgeting).
3. Open a course → open a lesson → open/play a video.

**Expected**
- Courses load from Supabase.
- Filter updates the list.
- Course details show lessons.
- Video player opens and plays without crash.

---

### TC‑07: Video Completion Tracking (if enabled)
**Steps**
1. Watch a lesson video to completion (or near completion).
2. Return to the course/lesson screen.

**Expected**
- Progress reflects completion.
- Points/XP/coins update if the reward logic is enabled for video completion.

---

### TC‑08: Quizzes (Open → Answer → Submit)
**Steps**
1. Open **Quizzes**.
2. Open a quiz.
3. Answer questions and submit.

**Expected**
- Quiz opens without a red error screen.
- Questions render reliably (no crash / infinite loading).
- Score is calculated and shown.
- Points/XP/coins update after completion if enabled.

---

### TC‑09: Leaderboard (Top 10 + Refresh)
**Steps**
1. Open **Leaderboard**.
2. Tap refresh (if available).

**Expected**
- Top users are displayed (top 10).
- Refresh reloads data without errors.

---

### TC‑10: Investment Simulator (Buy/Sell + P&L)
**Steps**
1. Open **Simulation / Investment**.
2. Confirm starting cash is **EGP 100,000**.
3. Buy shares of a stock.
4. Sell shares.

**Expected**
- Holdings update correctly after buy/sell.
- Portfolio value and P&L update correctly.
- Prices refresh over time if the periodic pull is enabled.

---

### TC‑11: Notifications Inbox Navigation
**Steps**
1. Tap the **notification bell** in the header (e.g., on Home).

**Expected**
- Opens a dedicated notifications inbox screen (`/notifications`).

---

### TC‑12: Edit Profile (Avatar Upload)
**Steps**
1. Go to **Profile → Edit profile**.
2. Pick an image from gallery.

**Expected**
- Avatar displays as a circular image.
- Avatar remains visible after navigating away and back (persistence depends on implementation).

---

## Admin verification
Admin UI is protected. The logged‑in user must have `profiles.is_admin = true`.

### TC‑A1: Open Admin Dashboard
**Steps**
1. Go to Settings.
2. Use the admin unlock gesture (**long‑press the settings icon ~5 seconds**).

**Expected**
- Navigates to Admin Dashboard.

### TC‑A2: Admin Areas
Validate these pages open and function:
- Users (list/search)
- Courses / Lessons / Videos (create/edit localized fields)
- Quizzes / Questions (create/edit, including Arabic options)
- Leaderboard (admin view)
- Analytics (stats load)
- Stock price overrides (simulator reflects changes after refresh/tick)

---

## Troubleshooting (common issues)
- **No Login/Signup and only guest/sync experience**:
  - The APK build is missing Supabase env vars (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`) at build time.
  - Action: rebuild the APK with correct EAS env vars.
- **Courses/Quizzes empty**:
  - Ensure `schema.sql` and `seeds.sql` were executed on the same Supabase project used by the APK.
- **Admin shows “Access denied”**:
  - Confirm `profiles.is_admin = true` for the logged‑in user in Supabase.
- **Video does not play**:
  - Confirm the URL is reachable and the video format is compatible with the device/player.

---

## Bug report template (copy/paste)
- **Title**:
- **Area/Screen**:
- **Environment**: Android device model + OS version
- **Account**: guest / user / admin
- **Steps to reproduce**:
  1.
  2.
  3.
- **Expected result**:
- **Actual result**:
- **Evidence**: screenshot/video + any error text

