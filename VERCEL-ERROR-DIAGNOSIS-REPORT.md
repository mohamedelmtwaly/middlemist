# تقرير تشخيص مشكلة "حدث خطأ في تحميل البيانات" - Vercel

**التاريخ:** 2026-11-13
**الغرض:** تشخيص سبب فشل تحميل البيانات على نسخة Vercel

---

## 1. فحص ملف إنشاء Supabase Client

### 1.1 الملف المسؤول
- **المسار:** `src/lib/supabase.ts`
- **الدالة:** `getSupabaseClient()`

### 1.2 أسماء متغيرات البيئة المستخدمة في الكود
```typescript
const supabaseUrl = import.meta.env['VITE_SUPABASE_URL']
const supabaseAnonKey = import.meta.env['VITE_SUPABASE_ANON_KEY']
```

**النتيجة:**
- ✅ الكود يقرأ: `VITE_SUPABASE_URL`
- ✅ الكود يقرأ: `VITE_SUPABASE_ANON_KEY`
- ✅ هذه الأسماء صحيحة لـ Vite (بادئة `VITE_` تُعرض للعميل)

### 1.3 منطق التحقق
```typescript
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local file.'
  )
}
```

**النتيجة:**
- إذا كان أحد المتغيرين مفقوداً، سيتم رمي خطأ واضح
- هذا الخطأ سيظهر في message: "Missing Supabase environment variables..."

---

## 2. التحقق من تطابق الأسماء

### 2.1 المتغيرات المضافة في Vercel (حسب تقريرك)
- `VITE_SUPABASE_URL` ✅
- `VITE_SUPABASE_ANON_KEY` ✅

### 2.2 أسماء المتغيرات في الكود
- `VITE_SUPABASE_URL` ✅
- `VITE_SUPABASE_ANON_KEY` ✅

**النتيجة:**
- ✅ الأسماء متطابقة تماماً
- ✅ لا يوجد فرق في التسمية

---

## 3. إصدار مكتبة Supabase

### 3.1 الإصدار الحالي
```json
"@supabase/supabase-js": "^2.119.0"
```

### 3.2 التوافق مع المفاتيح
- إصدار 2.x من Supabase JS يستخدم مفاتيح تبدأ بـ `sb_publishable_` للـ anon key
- هذا الإصدار يطابق المكتبة المستخدمة

**النتيجة:**
- ✅ الإصدار صحيح ومتوافق
- ✅ مفتاح `sb_publishable_` صحيح لهذا الإصدار

---

## 4. فحص وظائف تحميل المنتجات والتصنيفات

### 4.1 تحميل المنتجات
**الملف:** `src/lib/use-products.ts`
**الدالة:** `useProducts()`

```typescript
const { data, error } = await supabase
  .from('products')
  .select('*')
  .eq('is_active', true)
  .order('sort_order', { ascending: false });

if (error) {
  throw new Error(`فشل في جلب المنتجات: ${error.message}`);
}
```

**مصدر رسالة الخطأ:**
- إذا حدث خطأ، يظهر: `فشل في جلب المنتجات: ${error.message}`
- هذه الرسالة تظهر في `productsError.message`

### 4.2 تحميل التصنيفات
**الملف:** `src/lib/use-categories.ts`
**الدالة:** `useCategories()`

```typescript
const { data, error } = await supabase
  .from('categories')
  .select('*')
  .eq('is_active', true)
  .order('sort_order', { ascending: true });

if (error) {
  throw new Error(`فشل في جلب التصنيفات: ${error.message}`);
}
```

**مصدر رسالة الخطأ:**
- إذا حدث خطأ، يظهر: `فشل في جلب التصنيفات: ${error.message}`
- هذه الرسالة تظهر في `categoriesError.message`

### 4.3 عرض رسالة الخطأ في الصفحة الرئيسية
**الملف:** `src/routes/index.tsx` (السطور 602-606)

```typescript
<div className="flex items-center justify-center py-16">
  <AlertCircle className="h-8 w-8 text-destructive mb-4" />
  <p className="text-destructive mb-2">حدث خطأ في تحميل البيانات</p>
  <p className="text-sm text-primary-foreground/85">{productsError?.message || categoriesError?.message}</p>
</div>
```

**النتيجة:**
- الرسالة العامة: "حدث خطأ في تحميل البيانات"
- التفاصيل: `productsError?.message || categoriesError?.message`

---

## 5. معالجة أخطاء Supabase

### 5.1 أنواع الأخطاء المحتملة

#### أ) خطأ في المتغيرات البيئية
- **السبب:** المتغيرات غير مضافة أو فارغة في Vercel
- **الخطأ:** "Missing Supabase environment variables..."
- **الاحتمال:** منخفض (تم التأكيد من الإضافة)

#### ب) خطأ في الاتصال
- **السبب:** URL غير صحيح أو Supabase لا يستجيب
- **الخطأ من Supabase:** `Failed to fetch` أو `NetworkError`
- **الاحتمال:** منخفض (URL من `.env.local` عادة صحيح)

#### ج) خطأ RLS (Row Level Security)
- **السبب:** سياسات RLS تمنع الوصول للعميل
- **الخطأ من Supabase:** `Permissions denied` أو `403 Forbidden`
- **الاحتمال:** متوسط (هذا المشروع يستخدم Lovable، RLS قد يكون غير مضبوط)

#### د) خطأ في اسم الجدول
- **السبب:** الجدول غير موجود في قاعدة البيانات
- **الخطأ من Supabase:** `relation "products" does not exist`
- **الاحتمال:** منخفض (الجداول موجودة من سكريبتات الاستيراد)

#### هـ) خطأ في العمود
- **السبب:** العمود غير موجود في الجدول
- **الخطأ من Supabase:** `column "is_active" does not exist`
- **الاحتمال:** منخفض (العمود موجود حسب الـ types)

#### و) خطأ in SSR (Server-Side Rendering)
- **السبب:** الكود يحاول استخدام Supabase على السيرفر
- **الخطأ في الكود:** في `src/lib/supabase.ts`، السطر 7-11
  ```typescript
  if (import.meta.env.SSR) {
    throw new Error(
      'getSupabaseClient() should only be called in the browser (client-side).'
    )
  }
  ```
- **الاحتمال:** عالي (المشروع يستخدم TanStack Start مع SSR)

---

## 6. المشكلة المحتملة: SSR + Environment Variables

### 6.1 الإطار المستخدم
- **Framework:** TanStack Start (SSR-enabled)
- **Vite Plugin:** Lovable vite-tanstack-config
- **Server Entry:** `src/server.ts`

### 6.2 الإعدادات في vite.config.ts
```typescript
vite: {
  envDir: ".",
},
```

**التحليل:**
- `envDir: "."` يعني Vite سيبحث عن ملفات `.env` في دليل الجذر
- هذا صحيح لبيئة التطوير المحلية

### 6.3 المشكلة في Vercel
**تحليل مفتاح:**
1. Vite يحقن المتغيرات المسبوقة بـ `VITE_` في bundle للعميل
2. لكن هذا يعمل فقط في بيئة client-side
3. في TanStack Start، قد يكون هناك server-side code يحاول استخدام هذه المتغيرات
4. Supabase Client مصمم للعمل client-side فقط (حسب خط 7-11 في supabase.ts)

### 6.4 سبب الخطأ المحتمل الأرجح

**السبب:** المتغيرات البيئية في Vercel قد لا تُحقن بشكل صحيح في bundle production

**لماذا؟**
1. في التطوير المحلي، Vite يقرأ من `.env.local` ويحقن المتغيرات
2. في Vercel، المتغيرات تُضاف في Environment Variables
3. يجب أن يكون هناك إعدادات إضافية لضمان حقن المتغيرات في production bundle

**الخطوات المطلوبة في Vercel:**
1. التأكد من أن البيئة هي "Production" وليس "Preview"
2. التأكد من أن المتغيرات مضافة لجميع البيئات (Production, Preview, Development)
3. قد تحتاج إلى إضافة متغيرات بدون بادئة `VITE_` للاستخدام في server-side (إذا كان مطلوباً)

---

## 7. ملفات مسؤولة عن المشكلة

### 7.1 الملفات الرئيسية
1. `src/lib/supabase.ts` - إنشاء Supabase Client
2. `src/lib/use-products.ts` - تحميل المنتجات
3. `src/lib/use-categories.ts` - تحميل التصنيفات
4. `src/routes/index.tsx` - عرض الخطأ
5. `vite.config.ts` - إعدادات Vite
6. `vercel.json` - إعدادات Vercel

### 7.2 ملفات الثانوية
1. `src/server.ts` - Server entry point
2. `src/start.ts` - TanStack Start configuration
3. `package.json` - Dependencies

---

## 8. الملفات التي تحتاج مراجعة/تعديل (مستقبلاً)

### 8.1 الحلول المقترحة

#### الحل 1: إضافة متغيرات بدون بادئة VITE_ (لـ Vercel)
في Vercel، أضف:
- `SUPABASE_URL` (بدون VITE_)
- `SUPABASE_ANON_KEY` (بدون VITE_)

ثم عدل `src/lib/supabase.ts` لقراءة من:
```typescript
const supabaseUrl = import.meta.env['VITE_SUPABASE_URL'] || import.meta.env['SUPABASE_URL']
const supabaseAnonKey = import.meta.env['VITE_SUPABASE_ANON_KEY'] || import.meta.env['SUPABASE_ANON_KEY']
```

#### الحل 2: استخدام .env.production
إنشاء ملف `.env.production` في المشروع:
```env
VITE_SUPABASE_URL=https://your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```
وهذا الملف سيُحمل تلقائياً في production build.

#### الحل 3: إضافة define في vite.config.ts
```typescript
export default defineConfig({
  // ... existing config
  vite: {
    envDir: ".",
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY),
    },
  },
});
```

#### الحل 4: التحقق من RLS في Supabase
في Supabase Dashboard:
1. فتح Authentication → Policies
2. تحقق من سياسات `products` و `categories`
3. تأكد من أن `anon` role لديه صلاحية SELECT
4. إذا لم يكن، أضف سياسة:
```sql
CREATE POLICY "Enable read access for all users" ON products
FOR SELECT TO anon
USING (true);
```

---

## 9. ملخص السبب المحتمل

### التشخيص الأرجح:
**المتغيرات البيئية لا تُحقن بشكل صحيح في production bundle على Vercel.**

**الأسباب:**
1. Vite يحقن `VITE_*` متغيرات فقط في build time
2. في Vercel، قد لا تكون هذه المتغيرات متاحة في build time
3. الحل: إضافة متغيرات بدون بادئة أو استخدام `.env.production`

### السبب الثاني المحتمل:
**سياسات RLS في Supabase تمنع الوصول للمستخدمين `anon`.**

**الحل:** تحديث سياسات RLS في Supabase Dashboard

### السبب الثالث المحتمل:
**TanStack Start SSR يحاول استخدام Supabase على السيرفر، لكن الكود يمنع ذلك.**

**الحل:** التأكد من أن Supabase Client يُستخدم فقط client-side

---

## 10. الخطوات التالية الموصى بها

### خطوة 1: فحص Console في المتصفح
افتح موقع Vercel واضغط F12:
- تحقق من Console لأي أخطاء
- ابحث عن "Missing Supabase environment variables"
- ابحث عن أخطاء شبكة (Network errors)

### خطوة 2: إضافة متغيرات بدون بادئة في Vercel
أضف أيضًا:
- `SUPABASE_URL` (بدون VITE_)
- `SUPABASE_ANON_KEY` (بدون VITE_)

### خطوة 3: إنشاء .env.production
أنشئ هذا الملف المحلي وأضف المتغيرات، ثم أعد الرفع

### خطوة 4: تحقق من RLS في Supabase
اذهب إلى Supabase Dashboard وتحقق من سياسات RLS

---

## 11. ملاحظات أمنية

✅ **لم يتم عرض أي مفاتيح سرية في هذا التقرير**
✅ **لم يتم تعديل أي ملفات**
✅ **لم يتم تنفيذ أي عمليات على قاعدة البيانات**

---

**التقرير جاهز للمراجعة.** يرجى الموافقة على الحل المقترح أو طلب فحص إضافي.
