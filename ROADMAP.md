# 🗺️ Fin-Game — Roadmap & Progress Tracker

> **آخر تحديث**: 2026-04-22 — BRD gaps closed (Leaderboard + Topics + Forgot Password + Admin analytics + Investment start cash + stock overrides)
> **Stack**: React Native + Expo SDK 54 + Expo Router + NativeWind + React Native Paper + Zustand + Supabase
> **الهدف**: نبني تطبيق Fin-Game من الصفر للـ launch، خطوة خطوة، من غير ما ننسى حاجة.
>
> **طريقة الاستخدام**:
> - كل ما نخلّص خطوة، نحوّل `[ ]` لـ `[x]`
> - لو فيه ملاحظة، نكتبها تحت الخطوة
> - لو ظهرت مشكلة أو حاجة جديدة، نضيفها في "🐛 Issues & Notes" تحت

---

## 📊 نظرة عامة على التقدم

| المرحلة | الاسم | الحالة | التقدم |
|---|---|---|---|
| 0 | Setup & Foundations | ✅ خلصت | 6/6 |
| 1 | Expo Project + NativeWind + First Screen | ✅ خلصت | 9/9 |
| 2 | نبني كل الشاشات (Screens) | ✅ خلصت | 32/32 |
| 3 | State Management (Zustand) | ✅ خلصت | 11/11 |
| 4 | Backend & Auth (Supabase) | ✅ خلصت | 17/17 |
| 5 | Real Content & Simulations Logic | ✅ خلصت | 15/15 |
| 6 | Admin Dashboard | ✅ خلصت | 8/8 |
| 7 | Marketplace Integration | ✅ خلصت | 7/7 |
| 8 | i18n & Polish | ✅ خلصت | 6/6 |
| 9 | Testing & QA | 🟡 شغالين | 3/5 |
| 10 | Launch & Distribution | ⏳ لسه | 0/6 |

**Status legend**: ⏳ لسه | 🟡 شغالين فيها | ✅ خلصت | 🔴 متعطلة

---

## 🥇 المرحلة 0 — Setup & Foundations

- [x] **0.1** Node.js — ✅ v22.22.0
- [x] **0.2** `npm install` للمشروع الـ legacy — ✅ (محفوظ في `legacy-web/`)
- [x] **0.3** `tsconfig.json` — ✅ مع path alias `@/*`
- [x] **0.4** `.gitignore` — ✅ يشمل Expo + legacy-web artifacts
- [x] **0.5** فحص الـ dev server — ✅ شغل في البداية
- [x] **0.6** نقل الكود القديم لـ `legacy-web/` — ✅ كـ reference للشكل

---

## 🥈 المرحلة 1 — Expo Project + NativeWind + First Screen

> **الهدف**: نعمل React Native app بـ Expo، يطلع شكله زي التصميم، ونتأكد إنه شغال على الموبايل.

- [x] **1.1** Create Expo app (SDK 54, template default)
  - React 19.1.0, RN 0.81.5, Expo Router v6, New Architecture enabled
- [x] **1.2** Configure `app.json` for Fin-Game branding
  - name: "Fin-Game", slug: "fin-game", scheme: "fingame"
  - Android package: `com.fingame.app`
  - Splash screen: blue (#2563eb)
- [x] **1.3** Install core deps
  - nativewind, react-native-paper, lucide-react-native
  - react-native-svg, zustand, @react-native-async-storage/async-storage
  - expo-linear-gradient, tailwindcss 3
- [x] **1.4** Setup NativeWind
  - `tailwind.config.js` مع Fin-Game colors (primary blue + accent yellow)
  - `global.css`, `babel.config.js`, `metro.config.js`
  - `nativewind-env.d.ts`
- [x] **1.5** Setup theme
  - `theme/colors.ts` — نسخة من ألوان Tailwind القديمة
  - `theme/index.ts` — React Native Paper theme
  - `lib/format.ts` — `formatEGP`, `formatNumber`
- [x] **1.6** Build root layout
  - `app/_layout.tsx` بـ PaperProvider + GestureHandler + StatusBar
- [x] **1.7** Build `WelcomeScreen` (proof of concept)
  - `app/index.tsx` — نفس شكل الـ legacy: gradient blue + gamepad icon + yellow button
- [x] **1.8** Build stub `Dashboard` screen — ✅ placeholder للـ navigation
- [x] **1.9** جرّب التطبيق على موبايل فيزيائي عبر Expo Go — ✅ شغّال تمام!
  - **Expo Server**: Tunnel mode (عشان Firewall بيمنع LAN)
  - **مطلوب**: نضيف firewall rule لو عاوزين LAN mode أسرع

---

## 🥉 المرحلة 2 — نبني كل الشاشات (27 شاشة)

> **الهدف**: نحوّل كل شاشة من الـ legacy لـ React Native، شاشة شاشة، مع الحفاظ على الشكل.
>
> **الاستراتيجية**: نبني الأول الـ shared components (CoinsCounter, Card, Button, BottomNav) وبعدين الشاشات.

### Shared Components (نبنيها الأول)
- [x] **2.1** `components/ui/Button.tsx` ✅ (primary/secondary/accent/outline/ghost/destructive + 3 sizes)
- [x] **2.2** `components/ui/Card.tsx` ✅ (Card + PressableCard مع shadow)
- [x] **2.3** `components/ui/Badge.tsx` ✅ (7 variants)
- [x] **2.4** `components/ui/ProgressBar.tsx` ✅ (solid + gradient)
- [x] **2.5** `components/CoinsCounter.tsx` ✅ (الـ chip الأصفر مع عدد الكوينز)
- [x] **2.6** `components/StreakWidget.tsx` ✅ (flame/zap حسب عدد الأيام)
- [x] **2.7** `components/BottomNav.tsx` ✅ (5 tabs: Home / Fin-Tok / Courses / Rewards / Profile)
- [x] **2.8** `components/ScreenHeader.tsx` ✅ (gradient + back/menu + bell + coins)
- [x] **2.8b** `components/ComingSoon.tsx` ✅ (placeholder helper)

### Onboarding & Core
- [x] **2.9** `/` — WelcomeScreen ✅
- [x] **2.10** `/dashboard` — Dashboard ✅ (Header + welcome + streak + marketplace CTA + courses scroll + quiz/sim cards + leaderboard + bottom nav)
- [x] **2.11** `/courses` — CourseScreen ✅ (progress + video preview + sections list + discussion + reward)
- [x] **2.12** `/profile` — ProfileScreen ✅ (avatar + stats + learning progress + achievements + settings)
- [x] **2.13** `/marketplace` — RewardMarketplace ✅ (balance + category filter + rewards grid + redeem states)

### Simulation Hub
- [x] **2.14** `/simulation-hub` ✅ (XP bar + 6 simulations + difficulty badges + progress + master CTA)
- [x] **2.15** `/simulation/banking` — BankingDashboard ✅ (balance card + quick actions modal + savings link + health score + activity)
- [x] **2.16** `/simulation/investment` — Portfolio + Market ✅ (portfolio value + PnL + holdings/market tabs + trade modal)
- [x] **2.17** `/simulation/credit` — CreditDashboard ✅ (SVG score meter + utilization + cards + 8 scenarios + payment modal + activity log)
- [x] **2.18** `/simulation/gold` — GoldTrading ✅ (live prices + holdings + buy/sell grams modal + PnL)
- [x] **2.19** `/simulation/business` — BusinessSimulation ✅ (10 steps + decisions impact cash/reputation + reset)
- [x] **2.27** `/simulation/savings-goal` — SavingsGoal ✅ (goals list + add/contribute/delete modals)

### Community
- [x] **2.20** `/streak-calendar` ✅ (streak card + 30-day calendar + milestones + protections + tips)
- [x] **2.21** `/fintok` ✅ (vertical swipe feed + like/save/comment/share + Try Simulation CTA)
- [x] **2.22** `/marketplace` ✅ (فوق في 2.13)

### Financial Marketplace
- [x] **2.23** `/marketplace-home` ✅ — hub + level + recommendations + categories + applications + coin rewards
- [x] **2.24** `/marketplace/credit-cards` ✅ — 5 Egyptian cards + compare selection + filters modal + tier badges
- [x] **2.25** `/marketplace/compare` ✅ — side-by-side scrollable comparison + +10 coin reward
- [x] **2.26** `/marketplace/product/[id]` ✅ — overview + pros/cons + SVG approval meter + review form + reviews list
- [x] **2.27b** `/marketplace/loan-calculator` ✅ — full amortization formula + affordability check
- [x] **2.28** `/marketplace/application-tracking` ✅ — 4-step progress + simulate advance + alternatives suggestions

---

## 🏅 المرحلة 3 — State Management (Zustand)

- [x] **3.1** `stores/useUserStore.ts` ✅ (coins, XP, level, streak, profile, coinsLog, addCoins/spendCoins/addXP)
- [x] **3.2** `stores/useBankingStore.ts` ✅ (accounts, transactions, goals, deposit/withdraw/transfer)
- [x] **3.3** `stores/useInvestmentStore.ts` ✅ (5 Egyptian stocks + cash + holdings + trades + buy/sell + PnL)
- [x] **3.4** `stores/useGoldStore.ts` ✅ (Gold 24k/21k/18k + Silver + buy/sell + PnL)
- [x] **3.5** `stores/useBusinessStore.ts` ✅ (10 steps + cash + reputation + decisions + runMonth)
- [x] **3.6** Zustand persist middleware + AsyncStorage ✅ (`stores/storage.ts`)
- [x] **3.7** ربط الشاشات بالـ stores ✅ (Dashboard + Profile + Marketplace + Streak Calendar + Simulation Hub + Fin-Tok)
- [x] **3.8** Coins earning logic ✅ (`lib/rewards.ts` + triggers في Fin-Tok و daily login)
- [x] **3.9** Streak daily check logic ✅ (`hooks/useDailyCheckIn.ts` + Snackbar على Dashboard)
- [x] **3.10** `stores/useCreditStore.ts` ✅ (credit score + cards + payment modal + 8 scenarios)
- [x] **3.11** `stores/useMarketplaceStore.ts` ✅ (5 EG credit cards + reviews + applications + compare selection + tracking)

---

## 🎯 المرحلة 4 — Backend & Auth (Supabase)

### Setup
- [x] **4.1** حساب Supabase ✅ — Project `glwqopjorysuxajokqsz`
- [x] **4.2** Project جديد + keys في `.env` ✅
- [x] **4.3** `npm install @supabase/supabase-js` ✅ + `react-native-url-polyfill`
- [x] **4.4** `lib/supabase.ts` للـ client ✅ (مع AsyncStorage auth session)

### Database Schema (في `supabase/schema.sql` جاهز لتشغيله)
- [x] **4.5** `profiles` (user info, coins, XP, level, streak) ✅ + RLS + trigger
- [x] **4.6** **Coins sync** ✅ — `coins_log` ledger + auto-push profile.coins on every change
- [x] **4.7** **Profile + XP + Streak sync** ✅ — push profile on updates + pull on auth
- [x] **4.8** `courses` + `lessons` + `videos` ✅ — schema + seeds (5 courses, 15 lessons) + `useContentStore` + auto-sync on app boot
- [x] **4.9** `quizzes` + `questions` + `attempts` ✅ — schema + 50 seeded questions across 5 quizzes + `recordQuizAttempt()` + coin rewards
- [x] **4.10** `user_progress` + `redemptions` schema ✅ + `useSyncProgress()` hook — جاهز للـ simulations

### Auth & Sync Layer
- [x] **4.11** Login + Signup screens ✅ (`app/(auth)/login.tsx` + `signup.tsx` + guest mode)
- [x] **4.12** Supabase Auth (Email) ✅ — `useAuthStore` + session persist + auto-refresh
- [x] **4.13** **Sync Service** ✅ — `lib/syncService.ts` (pullProfile, pushProfile, logCoinChange, upsertProgress)
- [x] **4.14** **Auth ↔ User Store binding** ✅ — signup/login auto-binds, signout unbinds
- [x] **4.15** **Cloud Sync UI** ✅ — status + manual resync button في Profile screen

### Data Sync Layer
- [x] **4.16** Banking `transactions` table + sync ✅ — `banking_transactions` + RLS + auto-push on deposit/withdraw/transfer
- [x] **4.17** Investment `holdings` + `trades` + sync ✅ — `investment_holdings` + `investment_trades` + auto-push on buy/sell (+ delete when shares=0)

---

## 🎮 المرحلة 5 — Real Content & Simulations Logic

### Investment Simulator (EGX)
- [x] **5.1** 5 أسهم مصرية (COMI, ETEL, HRHO, TMGH, SWDY) ✅
- [x] **5.2** Market simulation engine (price fluctuations) ✅ — random-walk `tickMarket()` + `useMarketEngine` hook (6s tick) + priceHistory (60 ticks)
- [x] **5.3** Buy/Sell logic + portfolio calculation + avg cost + PnL ✅
- [x] **5.4** Stock detail screen مع chart ✅ — `app/investment/[symbol].tsx` + SVG `PriceChart` (react-native-svg)
- [x] **5.5** Order types: Market / Limit / Stop Loss ✅ — `placeOrder()` + pending orders list + auto-fill inside `tickMarket`

### Banking
- [x] **5.6** Transaction logic (deposit/withdraw/transfer + categories) ✅
- [x] **5.7** Savings goals (CRUD + contribute) ✅
- [x] **5.8** Loan calculator ✅ — amortization schedule (first 12 months) + one-time learning reward button
- [x] **5.9** Scenario challenges ✅ — `/challenges` list + `/challenges/[id]` play screen + Zustand store + Supabase progress upsert

### Gold & Silver
- [x] **5.10** أسعار الذهب (24K/21K/18K + Silver) ✅
- [x] **5.11** Buy/Sell + holdings بالجرامات ✅

### Business Simulation
- [x] **5.12** 10 steps مع decision options و impact على cash + reputation ✅
- [x] **5.13** P&L + Tax (22.5% corp + 14% VAT) ✅ — `runMonth()` يحسب VAT و Corp Tax، monthly reports list، `payTaxes()` action

### Quiz & Learning
- [x] **5.14** Bank of 50 seeded questions ✅ — 5 quizzes × 10 Q (investing, budgeting, EGX, credit, gold) مع explanation لكل سؤال
- [x] **5.15** Video player + tracking ✅ — `app/lesson/[id].tsx` مع `expo-video` + auto-complete عند 90% مشاهدة + `watchedVideos` state + Supabase sync (`kind='video'`)

---

## 👨‍💼 المرحلة 6 — Admin Dashboard

- [x] **6.1** Admin web app منفصل (أو route محمي)
- [x] **6.2** Admin Auth (role-based)
- [x] **6.3** Analytics dashboard
- [x] **6.4** User management
- [x] **6.5** Video upload
- [x] **6.6** Quiz editor
- [x] **6.7** Stock prices editor
- [x] **6.8** Leaderboard view

---

## 🛒 المرحلة 7 — Marketplace Integration

- [x] **7.1** جمع داتا 5 credit cards مصرية ✅ (CIB, NBE, Banque Misr, HSBC, Alex Bank — في `useMarketplaceStore`)
- [x] **7.2** `marketplace_products` في Supabase ✅ — table + seeds + `pullMarketplaceProducts()` + `useMarketplaceStore.syncFromCloud()`
- [x] **7.3** ربط `CreditCardListing` ✅
- [x] **7.4** ربط `ProductDetail` + `ProductComparison` ✅
- [x] **7.5** Approval Odds Calculator ✅ — SVG meter مع age/income/credit score
- [x] **7.6** Application Tracking ✅ — 4-step progress مع simulate advance
- [x] **7.7** Reviews & ratings ✅ — user form + helpful votes + rating recalc

---

## 🌍 المرحلة 8 — i18n & Polish

- [x] **8.1** Lightweight i18n layer ✅ (`lib/i18n.ts` مع EN + AR dicts بدل `i18next` عشان نخف bundle)
- [x] **8.2** `lib/i18n.ts` fluent dict + `useT()` hook + `useLocaleStore` (persisted) ✅
- [x] **8.3** Language switcher في Profile ✅ (Alert picker + live locale update)
- [x] **8.4** RTL support للعربي ✅ (auto `I18nManager.forceRTL` لما اللغة تتغير)
- [x] **8.5** Loading/error states ✅ — Skeleton UI في `Courses` و `Course Detail` + empty-state مع Retry sync
- [x] **8.6** Animations (Reanimated) ✅ — `FadeInView`, `AnimatedNumber`, entrance animations على Welcome + Dashboard

---

## 🧪 المرحلة 9 — Testing & QA

- [x] **9.1** Jest + React Native Testing Library ✅ (`jest-expo` + config + setup)
- [x] **9.2** Tests للـ stores ✅ (Zustand stores)
- [x] **9.3** Tests للـ business logic ✅ (basic coverage)
- [ ] **9.4** Manual QA على Android + iOS
  - Checklist: `QA_CHECKLIST.md`
- [ ] **9.5** Performance profiling
  - Run a “production-like” bundle: `npx expo start --no-dev --minify` (then test core flows)
  - Watch for jank / memory spikes on low-end devices (Profile + Courses + Video + Investment)

---

## 🚀 المرحلة 10 — Launch & Distribution

- [x] **10.1** App icon + Splash screen مخصصين لـ Fin-Game ✅ (assets/images/*)
- [x] **10.2** Privacy Policy + Terms ✅ (`PRIVACY_POLICY.md` + `TERMS.md`)
- [ ] **10.3** Screenshots (5-8) للـ Play Store
- [x] **10.4** App description (عربي + إنجليزي) ✅ (`STORE_LISTING.md`)
- [ ] **10.5** `eas build` لـ Android (Play Store) + upload AAB
- [ ] **10.6** Play Store submission

**Optional iOS**:
- [ ] Apple Developer account
- [ ] `eas build` لـ iOS
- [ ] TestFlight + App Store

---

## 🎁 Future Features (بعد الـ MVP)

- [ ] Push notifications (streak reminders)
- [ ] Social features (friends, share)
- [ ] Live market data (API)
- [ ] Banking API integration
- [ ] AI financial advisor chatbot
- [ ] UGC videos
- [ ] Affiliate commission tracking
- [ ] In-app purchases (Premium)
- [ ] Dark mode
- [ ] Tablet/desktop responsive

---

## 🐛 Issues & Notes

| التاريخ | الملاحظة | الحالة |
|---|---|---|
| 2026-04-19 | بعض الـ legacy routes متكررة (Personal Finance + Banking نفس الشاشة) | ⏳ نوحّدها |
| 2026-04-19 | `BankingDashboard` في الـ legacy بيعمل navigate لـ `/simulation/banking/send` مش موجود | ⏳ نضيفه أو نشيله |
| 2026-04-19 | `guidelines/Guidelines.md` فاضي | ✅ |
| 2026-04-19 | Expo CI=1 stuck في environment — لازم نفتح terminal جديد | ✅ |
| 2026-04-19 | Windows Firewall بيمنع الموبايل يوصل LAN على port 8081 | 🟡 نستخدم tunnel لحد ما نضيف firewall rule |
| 2026-04-19 | Tunnel URL بيتغير كل مرة — هنحتاج `eas update` للـ preview لاحقاً | ⏳ |

---

## 📚 Resources & Links

- [Expo Docs](https://docs.expo.dev/)
- [Expo Router Docs](https://docs.expo.dev/router/introduction/)
- [NativeWind Docs](https://www.nativewind.dev/)
- [React Native Paper](https://callstack.github.io/react-native-paper/)
- [Zustand Docs](https://github.com/pmndrs/zustand)
- [Supabase Docs](https://supabase.com/docs)
- [Lucide Icons](https://lucide.dev/icons/)
- Figma Design: https://www.figma.com/design/XyLzM1FltcA2f5b9295tvM/Fin-Game

---

## ✅ Decision Log

| التاريخ | القرار | السبب |
|---|---|---|
| 2026-04-19 | React Native + Expo (بدل Capacitor) | Native feel + performance أحسن |
| 2026-04-19 | Expo (بدل Bare CLI) | أسهل — مش محتاج Android Studio للتطوير |
| 2026-04-19 | NativeWind v4 + React Native Paper | نحافظ على Tailwind + نستبدل shadcn |
| 2026-04-19 | Expo Router (بدل React Navigation) | File-based routing (زي Next.js) |
| 2026-04-19 | نحتفظ بالكود القديم في `legacy-web/` | reference للشكل والـ business logic |
| 2026-04-19 | Supabase للـ backend | Auth + DB + Storage مجاناً في البداية |
| 2026-04-19 | Zustand للـ state | أبسط من Redux |
| 2026-04-19 | App ID = `com.fingame.app` | للـ Play Store لاحقاً |

---

## 📱 كيفية التشغيل (Development)

### على الكمبيوتر
```bash
npm install
npx expo start --lan
```

### على الموبايل (Android)
1. حمّل **Expo Go** من Google Play Store
2. افتح Expo Go واختر "Enter URL manually"
3. أدخل: `exp://192.168.1.108:8081` (حسب IP الكمبيوتر)
4. تأكد الكمبيوتر والموبايل على نفس الـ WiFi

### على الموبايل (iOS)
1. حمّل **Expo Go** من App Store
2. افتح الكاميرا واعمل scan للـ QR code
3. هيفتح في Expo Go

### Clear cache
```bash
npx expo start --clear
```

---

**🎯 الخطوة الجاية المقترحة**: تجرّب التطبيق على موبايلك عبر Expo Go، وتأكد إن WelcomeScreen شغال وشكله تمام. بعدين نبدأ المرحلة 2 ونبني باقي الشاشات.
