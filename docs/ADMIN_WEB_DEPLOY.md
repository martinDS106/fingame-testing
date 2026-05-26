# نشر لوحة الأدمن على الويب (رابط واحد للفريق)

بدل ما كل مطوّر يشغّل `npx expo start --web` على جهازه، تبني المشروع مرة واحدة وتنشره على استضافة ثابتة (Vercel أو Netlify). أي لابتوب يفتح نفس الرابط.

## ماذا يُنشر؟

نفس تطبيق Expo (ويب)، بما فيه مسارات `/admin/*`. الـ API يبقى على Railway:

`https://fingame-testing-production.up.railway.app`

## المتطلبات

1. حساب على [Vercel](https://vercel.com) أو [Netlify](https://netlify.com)
2. المستودع على GitHub: `martinDS106/fingame-testing`
3. على **Railway** (خدمة الـ backend): متغير `ADMIN_EMAILS` فيه كل إيميلات الأدمن (مفصولة بفاصلة)
4. إيميل الأدمن مسجّل في التطبيق (تسجيل دخول عادي)

## الخطوة 1 — متغيرات البناء (مهمة)

قيم `EXPO_PUBLIC_*` تُدمَج وقت البناء، ليست وقت التشغيل فقط.

| المتغير | مثال للإنتاج |
|---------|----------------|
| `EXPO_PUBLIC_API_BASE_URL` | `https://fingame-testing-production.up.railway.app` |
| `EXPO_PUBLIC_ENABLE_ADMIN_UI` | `true` |
| `EXPO_PUBLIC_ADMIN_EMAILS` | `finadmin321@gmail.com,dev2@example.com` |

على **Railway** (backend) يجب أن يطابق:

`ADMIN_EMAILS=finadmin321@gmail.com,dev2@example.com`

(نفس القائمة — الـ API يحدد `isAdmin` عند تسجيل الدخول.)

## الخطوة 2 — النشر على Vercel (موصى به)

1. ادخل [vercel.com](https://vercel.com) → **Add New Project**
2. اختر مستودع `fingame-testing`
3. **Root Directory**: اتركه `.` (جذر المشروع، ليس مجلد `backend`)
4. الإعدادات تُقرأ من `vercel.json` تلقائياً:
   - Build: `npm run web:export`
   - Output: `dist`
5. **Environment Variables** (Production): أضف الثلاثة أعلاه
6. **Deploy**

بعد النشر ستحصل على رابط مثل:

`https://fingame-testing.vercel.app`

## الخطوة 3 — استخدام اللوحة

1. افتح: `https://YOUR-SITE.vercel.app/login`
2. سجّل دخول بإيميل موجود في `ADMIN_EMAILS`
3. افتح: `https://YOUR-SITE.vercel.app/admin`

إذا ظهر "Access denied": تأكد من تسجيل الدخول، ومن تطابق الإيميل على Railway و`EXPO_PUBLIC_ADMIN_EMAILS`، ثم أعد النشر بعد تغيير متغيرات Vercel.

## بديل: Netlify

1. ربط نفس المستودع
2. الإعدادات من `netlify.toml` (أو يدوياً: build `npm run web:export`, publish `dist`)
3. نفس متغيرات البيئة الثلاثة
4. `public/_redirects` يدعم SPA routing على Netlify

## بناء محلي (اختبار قبل النشر)

```bash
# من جذر المشروع
set EXPO_PUBLIC_API_BASE_URL=https://fingame-testing-production.up.railway.app
set EXPO_PUBLIC_ENABLE_ADMIN_UI=true
set EXPO_PUBLIC_ADMIN_EMAILS=finadmin321@gmail.com

npm run web:export
npx serve dist
```

ثم افتح `http://localhost:3000/admin` (أو المنفذ الذي يعرضه `serve`).

## إضافة مطوّر جديد

1. أضف إيميله في **Railway** → `ADMIN_EMAILS`
2. أضف نفس الإيميل في **Vercel/Netlify** → `EXPO_PUBLIC_ADMIN_EMAILS`
3. أعد **Deploy** على الاستضافة (لأن `EXPO_PUBLIC_*` تُبنى في الـ bundle)
4. يفتح نفس الرابط من أي جهاز — لا حاجة لـ `expo start` محلياً

## ملاحظات

- مجلد `dist/` في `.gitignore` — النشر عبر CI (Vercel/Netlify) وليس برفع `dist` يدوياً.
- سكربت `npm run web:export` يشغّل `patch-expo-web-modules.mjs` لإصلاح تحميل الـ bundle على الاستضافة الثابتة.
- CORS على الـ backend مفعّل (`origin: true`) — رابط Vercel يعمل مع Railway.
