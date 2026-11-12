# دليل النشر على Vercel - Middlemist Flower

**التاريخ:** 2026-11-13
**الغرض:** دليل خطوة بخطوة لنشر المشروع على Vercel مع Supabase

---

## المتطلبات الأساسية

1. **حساب Vercel:** حساب على [vercel.com](https://vercel.com)
2. **حساب GitHub:** حساب على [github.com](https://github.com)
3. **حساب Supabase:** مشروع Supabase جاهز
4. **الوصول إلى مفاتيح Supabase:**
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY

---

## الخطوة 1: إعداد Git (إذا لم يكن موجوداً)

### 1.1 تهيئة Git
```bash
cd D:\carrer\Working\middlemis\cop4\project-revival-77-main\project-revival-77-main
git init
git add .
git commit -m "Initial commit - Middlemist Flower Store"
```

### 1.2 إنشاء مستودع على GitHub
1. اذهب إلى [github.com](https://github.com)
2. انقر على "+" → "New repository"
3. أدخل اسم المستودع: `middlemist-flower`
4. اجعله Public أو Private (حسب تفضيلك)
5. انقر على "Create repository"

### 1.3 ربط المشروع بـ GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/middlemist-flower.git
git branch -M main
git push -u origin main
```

---

## الخطوة 2: ربط المشروع بـ Vercel

### 2.1 تسجيل الدخول إلى Vercel
1. اذهب إلى [vercel.com](https://vercel.com)
2. سجل الدخول أو أنشئ حساب جديد
3. يمكنك استخدام حساب GitHub لتسجيل الدخول

### 2.2 استيراد المشروع
1. بعد تسجيل الدخول، انقر على "Add New" → "Project"
2. اختر "Import Git Repository"
3. اختر مستودع `middlemist-flower` من GitHub
4. انقر على "Import"

---

## الخطوة 3: إعدادات المشروع في Vercel

### 3.1 إعدادات البناء (Build Settings)
في صفحة إعدادات المشروع، Vercel سيكتشف تلقائياً:

- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

إذا لم يتم الكشف التلقائي، أدخل هذه القيم يدوياً.

### 3.2 إضافة المتغيرات البيئية (Environment Variables)

هذه الخطوة **مهمة جداً** لكي يعمل الموقع مع Supabase.

1. في صفحة إعدادات المشروع، انقر على "Settings" → "Environment Variables"
2. أضف المتغيرات التالية:

#### المتغير 1: VITE_SUPABASE_URL
- **Name:** `VITE_SUPABASE_URL`
- **Value:** انسخ هذا من ملف `.env.local` (يبدأ بـ `https://`)
- **Environment:** Production, Preview, Development (اختر الكل)

#### المتغير 2: VITE_SUPABASE_ANON_KEY
- **Name:** `VITE_SUPABASE_ANON_KEY`
- **Value:** انسخ هذا من ملف `.env.local` (القيمة تبدأ بـ `sb_publishable_`)
- **Environment:** Production, Preview, Development (اختر الكل)

⚠️ **مهم:** لا تضيف `SUPABASE_SECRET_KEY` إلى Vercel! هذا المفتاح يجب أن يبقى فقط على جهازك.

### 3.3 حفظ الإعدادات
انقر على "Save" لحفظ المتغيرات البيئية.

---

## الخطوة 4: النشر (Deploy)

### 4.1 النشر الأولي
1. بعد إضافة المتغيرات البيئية، انقر على "Deploy"
2. انتظر حتى تكتمل عملية البناء
3. عند نجاح النشر، ستحصل على رابط مثل: `https://middlemist-flower.vercel.app`

### 4.2 التحقق من النشر
1. افتح الرابط في المتصفح
2. تحقق من:
   - الصفحة الرئيسية تعمل
   - المنتجات تظهر
   - الصور تحمل من Supabase Storage
   - لوحة التحكم تعمل (أدخل بيانات المسؤول)

---

## الخطوة 5: إعداد Domain مخصص (اختياري)

إذا كان لديك domain خاص:

### 5.1 إضافة Domain في Vercel
1. في صفحة المشروع، انقر على "Settings" → "Domains"
2. انقر على "Add Domain"
3. أدخل اسم domain (مثلاً: `middlemist.com`)

### 5.2 تحديث DNS
1. سيعطيك Vercel سجلات DNS لإضافتها
2. اذهب إلى مزود الاستضافة الخاص بك
3. أضف السجلات التالية:
   - **CNAME:** اسم النطاق → cname.vercel-dns.com
4. انتظر حتى تنتشر التغييرات (قد يستغرق 24-48 ساعة)

---

## الخطوة 6: إعداد Git Workflow للمستقبل

### 6.1 تطوير التغييرات
عندما تريد إضافة تغييرات:

```bash
# إضافة التغييرات
git add .

# حفظ التغييرات
git commit -m "وصف التغيير"

# رفع إلى GitHub
git push
```

### 6.2 النشر التلقائي
Vercel سيراقب تغييرات Git وسيقوم بالنشر تلقائياً عند كل `git push`.

---

## الخطوة 7: إدارة المتغيرات البيئية المحلية

### 7.1 ملف .env.local
احتفظ بملف `.env.local` على جهازك للتطوير المحلي:

```env
VITE_SUPABASE_URL=https://rgnpxovzbwzfofbbsaja.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_CNytR5hl4BykdbIfMndUSg_Xg5MCuzV
SUPABASE_SECRET_KEY=your_secret_key_here
```

### 7.2 ملف .env.example
ملف `.env.example` موجود بالفعل في المشروع - يحتوي على مثال للتنسيق.

---

## استكشاف الأخطاء الشائعة

### مشكلة: موقع لا يعرض البيانات من Supabase
**الحل:**
- تأكد من إضافة المتغيرات البيئية في Vercel
- تأكد من أن `VITE_SUPABASE_URL` و `VITE_SUPABASE_ANON_KEY` صحيحة
- تحقق من Console في المتصفح لأي أخطاء

### مشكلة: الصور لا تحمل
**الحل:**
- تأكد من أن bucket `product-images` في Supabase هو public
- تحقق من سياسات RLS للـ Storage

### مشكلة: لوحة التحكم لا تعمل
**الحل:**
- تأكد من أن الحساب مسجل في Supabase Auth
- تأكد من أن `user_metadata.role = 'admin'`
- تحقق من Console لأي أخطاء

### مشكلة: Build fails
**الحل:**
- تأكد من أن جميع dependencies مثبتة
- تحقق من أن Node.js متوافق (يستخدم المشروع Node.js الحديث)
- راجع logs في Vercel Dashboard

---

## الملفات المهمة للنشر

- ✅ `vercel.json` - إعدادات Vercel (تم إنشاؤه)
- ✅ `.gitignore` - لاستبعاد الملفات الحساسة
- ✅ `package.json` - تعريفات المشروع
- ✅ `vite.config.ts` - إعدادات Vite

---

## الأمان

### لا ترفع إلى Git:
- ❌ `.env.local` (يحتوي على مفاتيح سرية)
- ❌ أي ملفات تحتوي على مفاتيح API
- ❌ ملفات logs

### الملفات المرفوعة إلى Git:
- ✅ الكود المصدري
- ✅ ملفات التكوين
- ✅ ملفات الأصول (assets)

---

## الدعم

إذا واجهت أي مشاكل:

1. تحقق من Vercel Dashboard → Logs
2. تحقق من Console في المتصفح
3. راجع هذا الدليل
4. راجع توثيق Vercel: [vercel.com/docs](https://vercel.com/docs)
5. راجع توثيق Supabase: [supabase.com/docs](https://supabase.com/docs)

---

## ملخص سريع

1. ✅ أضف المشروع إلى Git
2. ✅ ارفع إلى GitHub
3. ✅ استورد المشروع في Vercel
4. ✅ أضف متغيرات البيئية (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
5. ✅ انقر Deploy
6. ✅ تحقق من الموقع

---

**جاهز للنشر!** 🚀

بعد إكمال هذه الخطوات، سيكون موقعك متاحاً على رابط Vercel وسيكون متصلاً بقاعدة بيانات Supabase.
