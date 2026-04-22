# ✅ Fin-Game — QA Checklist (Phase 9.4)

الهدف من الملف ده إن أي حد في الفريق يقدر يعمل **Manual QA** بسرعة وبنفس الخطوات، قبل الـ release.

> **قاعدة ذهبية**: اختبر مرتين — مرة **EN (LTR)** ومرة **AR (RTL)**.

---

## الأجهزة/البيئات المطلوبة

- **Android**: جهاز فعلي (أفضل من emulator) + Expo Go أو dev build
- **iOS**: جهاز فعلي + Expo Go أو dev build
- **شبكة**: Wi‑Fi + تجربة 4G/5G (لو متاح)

---

## A) Smoke test (5–10 دقائق)

- **الإقلاع**: التطبيق يفتح بدون crash.
- **Navigation**: BottomNav يودّي لكل tab بدون مشاكل.
- **Auth**:
  - Signup / Login شغالين.
  - Logout بيرجعك لحالة سليمة.
- **Content sync**:
  - Course/Quiz lists بتظهر بيانات (مش شاشة فاضية).
  - لو Supabase مش متوصل: التطبيق بيشتغل بـ fallback بدون crash.

---

## B) Core flows (15–25 دقيقة)

### 1) Courses / Lessons / Video
- افتح كورس → افتح درس → شغل فيديو.
- سيب الفيديو لحد ما يعدّي **90%** (أو قرب للنهاية) وتأكد:
  - الدرس اتعلّم **Completed** (لو ده سلوك المنتج).
  - الـ progress اتسجّل بدون errors (لو عندك sync status ظاهر).

### 2) Quizzes
- افتح كويز → جاوب → submit.
- تأكد:
  - النتيجة بتظهر.
  - الكوينز بتتضاف حسب النتيجة.

### 3) Simulations (مسار سريع)
- Banking: deposit/withdraw يظهروا في activity.
- Investment: buy/sell يغير holdings و PnL.
- Gold: buy/sell يغير holdings.
- Business: runMonth يحسب tax/rep/cash.

---

## C) i18n / RTL (10–15 دقيقة)

- من Profile غيّر اللغة:
  - **EN**: ترتيب ومحاذاة سليمة.
  - **AR**: RTL شغال.
- تأكد:
  - عناوين الكورسات/الدروس/الفيديو/الكويز بتتغير للعربي لو متوفر.
  - لو العربي فاضي: **fallback** للإنجليزي.
- في الكويز:
  - لو فيه `options_ar` موجودة: الاختيارات تظهر بالعربي.

---

## D) Admin (لو أنت أدمن)

- افتح `/admin`:
  - Access denied = **لازم** تراجع `profiles.is_admin`.
- جرّب تعديل:
  - Course title + title (ar)
  - Quiz question + options (ar)
- بعد Save:
  - ارجع للشاشات الأساسية وتأكد إن التغيير ظهر.

---

## E) Negative / edge cases (اختياري)

- **Offline**: افتح التطبيق بدون نت → مفيش crash.
- **Slow network**: تحميل المحتوى مايبقاش “معلق” من غير feedback.
- **Bad input** (Admin):
  - `options_ar` بعدد أسطر مختلف عن الإنجليزي لازم يرفض الحفظ.

---

## تسجيل النتائج

اكتب لكل تشغيل:
- Device + OS
- Locale (EN/AR)
- نتيجة smoke/core/admin
- Bugs (خطوات إعادة + screenshot)

