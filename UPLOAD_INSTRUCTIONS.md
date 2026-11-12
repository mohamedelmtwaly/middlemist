# تعليمات رفع صور المنتجات إلى Supabase Storage

## المتطلبات

1. الحصول على Service Role Key من Supabase
2. إضافة المفتاح إلى ملف `.env.local`
3. تشغيل سكريبت الرفع

---

## الخطوة 1: الحصول على Service Role Key

1. اذهب إلى [Supabase Dashboard](https://supabase.com/dashboard)
2. اختر مشروعك
3. اذهب إلى **Project Settings** → **API**
4. ابحث عن قسم **Project API keys**
5. انسخ `service_role (secret)` key
   - ⚠️ **مهم:** هذا المفتاح يمنح صلاحيات كاملة، لا تشاركه مع أحد
   - ⚠️ **مهم:** لا تضعه في كود الواجهة الأمامية أو GitHub

---

## الخطوة 2: إضافة المفتاح إلى .env.local

افتح ملف `.env.local` في جذر المشروع وأضف السطر التالي:

```
SUPABASE_SECRET_KEY=your_service_role_key_here
```

استبدل `your_service_role_key_here` بالمفتاح الفعلي الذي نسخته.

**مثال:**
```
VITE_SUPABASE_URL=https://rgnpxovzbwzfofbbsaja.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_CNytR...
SUPABASE_SECRET_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## التحقق من .gitignore

ملف `.env.local` مستثنى بالفعل من Git في `.gitignore`:

```
# Environment variables
.env
.env.local
.env.*.local
```

✅ المفتاح السري لن يتم رفعه إلى GitHub تلقائيًا.

---

## الخطوة 3: تشغيل سكريبت الرفع

### من سطر الأوامر (Terminal):

```bash
cd "D:\carrer\Working\middlemis\cop4\project-revival-77-main\project-revival-77-main"
node upload-images-secret.cjs
```

### أو باستخدام PowerShell:

```powershell
cd "D:\carrer\Working\middlemis\cop4\project-revival-77-main\project-revival-77-main"
node upload-images-secret.cjs
```

---

## ما يفعله السكريبت

1. ✅ يقرأ `product-image-mapping.json`
2. ✅ يستخرج الصور الـ295 المرتبطة والموجودة فعليًا
3. ✅ يرفع الصور إلى `product-images/products/`
4. ✅ يستخدم `upsert: false` لمنع استبدال الملفات الموجودة
5. ✅ يرفع على دفعات (10 صور لكل دفعة)
6. ✅ يسجل نجاح وفشل كل صورة
7. ✅ يتحقق من الملفات المرفوعة بعد الرفع
8. ✅ يعرض الحجم الإجمالي للملفات المرفوعة

---

## المخرجات المتوقعة

- عدد الصور التي تم رفعها بنجاح
- عدد الصور التي تم تخطيها (موجودة مسبقًا)
- عدد الصور التي فشل رفعها
- العدد الفعلي للصور في `products/`
- الحجم الإجمالي للملفات المرفوعة

---

## ملاحظات أمنية

⚠️ **بعد الرفع:**
- يمكنك حذف `SUPABASE_SECRET_KEY` من `.env.local` إذا لم تعد بحاجة إليه
- لا تشارك ملف `.env.local` مع أي شخص
- تأكد أن `.env.local` في `.gitignore`

---

## استكشاف الأخطاء

### خطأ: "SUPABASE_SECRET_KEY غير موجود"
- تأكد من إضافة المفتاح إلى `.env.local`
- تأكد من أن الملف موجود في جذر المشروع

### خطأ: "new row violates row-level security policy"
- Service Role key يتجاوز RLS، لذا هذا الخطأ لا يجب أن يظهر
- إذا ظهر، تأكد من استخدام المفتاح الصحيح (service_role وليس anon)

### خطأ: "Bucket not found"
- تأكد من أن الـ Bucket `product-images` موجود في Supabase Storage
- إذا لم يكن موجودًا، أنشئه من Dashboard

---

## الملفات المجهزة

1. `upload-images-secret.cjs` - سكريبت الرفع (Node.js)
2. `.env.local` - ملف متغيرات البيئة (يحتاج إلى إضافة المفتاح)
3. `.gitignore` - يستثني `.env.local` من Git (موجود بالفعل)
