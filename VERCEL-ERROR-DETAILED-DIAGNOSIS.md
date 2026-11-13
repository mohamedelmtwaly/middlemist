# تقرير تشخيص محدد لمشكلة تحميل البيانات - Vercel

**التاريخ:** 2026-11-13
**الغرض:** تشخيص دقيق ومحدد لسبب فشل تحميل البيانات على Vercel

---

## 1. فحص ملف إنشاء Supabase Client

### 1.1 الملف المسؤول
- **المسار:** `src/lib/supabase.ts`
- **السطور:** 1-28

### 1.2 طريقة قراءة متغيرات البيئة
```typescript
const supabaseUrl = import.meta.env['VITE_SUPABASE_URL']
const supabaseAnonKey = import.meta.env['VITE_SUPABASE_ANON_KEY']
```

**النتيجة:**
- ✅ يستخدم `import.meta.env` (Vite-specific)
- ✅ لا يستخدم `process.env`
- ✅ هذا صحيح لبيئة client-side في Vite

### 1.3 حماية SSR
```typescript
if (import.meta.env.SSR) {
  throw new Error(
    'getSupabaseClient() should only be called in the browser (client-side).'
  )
}
```

**النتيجة:**
- ✅ الملف مصمم للعمل في Browser فقط
- ✅ يمنع الاستخدام في SSR
- ✅ يرمي خطأ واضح إذا تم استدعاؤه على السيرفر

---

## 2. أماكن استيراد Supabase Client

### 2.1 جميع الملفات التي تستورد getSupabaseClient
عدد الملفات: 9 ملفات

1. `src/lib/use-auth.ts` (4 استخدامات)
2. `src/lib/use-products.ts` (1 استخدام)
3. `src/lib/use-categories.ts` (1 استخدام)
4. `src/lib/use-admin-products.ts` (8 استخدامات)
5. `src/lib/use-admin-categories.ts` (9 استخدامات)
6. `src/routes/admin.products.tsx` (2 استخدامات)
7. `src/routes/debug-hide-product.tsx` (2 استخدامات)
8. `src/lib/supabase.ts` (التعريف الأصلي)

### 2.2 ملاحظة مهمة
جميع الملفات تستخدم `getSupabaseClient()` دالة واحدة موحدة، مما يعني:
- لا يوجد إنشاء Supabase Client متعدد
- لا يوجد استخدام process.env
- لا يوجد استخدام Client-side في Server Functions

**النتيجة:**
- ✅ لا يوجد استخدام Browser Client داخل Server Functions بطريقة غير صحيحة
- ✅ جميع الاستخدامات من خلال `getSupabaseClient()` المحمي

---

## 3. هل المشروع يحتاج متغيرات VITE_* ومتغيرات Server منفصلة؟

### 3.1 تحليل الكود الفعلي
```typescript
// يستخدم فقط import.meta.env['VITE_*']
const supabaseUrl = import.meta.env['VITE_SUPABASE_URL']
const supabaseAnonKey = import.meta.env['VITE_SUPABASE_ANON_KEY']
```

### 3.2 تحليل SSR
- المشروع يستخدم TanStack Start (SSR-enabled)
- لكن `getSupabaseClient()` يمنع الاستخدام في SSR (السطر 7-11)
- جميع دوال تحميل البيانات (`useProducts`, `useCategories`) تستخدم React Query
- React Query يُنفذ في client-side افتراضياً

### 3.3 الاستنتاج
- ✅ المشروع **لا يحتاج** متغيرات Server منفصلة
- ✅ المشروع يستخدم فقط متغيرات `VITE_*` للـ client-side
- ✅ حماية SSR مضمّنة في الكود

**النتيجة:**
- ❌ لا حاجة لإضافة متغيرات بدون بادئة `VITE_`
- ❌ إضافة متغيرات بدون بادئة لن يحل المشكلة

---

## 4. دوال تحميل المنتجات والتصنيفات

### 4.1 useProducts Hook
**الملف:** `src/lib/use-products.ts` (السطور 26-50)

```typescript
export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: false });

      if (error) {
        throw new Error(`فشل في جلب المنتجات: ${error.message}`);
      }
      // ...
    },
    staleTime: 5 * 60 * 1000,
  });
}
```

**التنفيذ:**
- ✅ يستخدم React Query
- ✅ React Query يُنفذ في client-side افتراضياً
- ✅ لا يوجد server-side data fetching

### 4.2 useCategories Hook
**الملف:** `src/lib/use-categories.ts` (السطور 15-44)

```typescript
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async (): Promise<Category[]> => {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        throw new Error(`فشل في جلب التصنيفات: ${error.message}`);
      }
      // ...
    },
    staleTime: 10 * 60 * 1000,
  });
}
```

**التنفيذ:**
- ✅ يستخدم React Query
- ✅ React Query يُنفذ في client-side افتراضياً
- ✅ لا يوجد server-side data fetching

**النتيجة:**
- ✅ جميع دوال تحميل البيانات تُنفذ في المتصفح (client-side)
- ✅ لا توجد server-side data fetching قد تسبب مشاكل مع متغيرات البيئة

---

## 5. كيفية ظهور الخطأ في الواجهة

### 5.1 عرض الخطأ في الصفحة الرئيسية
**الملف:** `src/routes/index.tsx` (السطور 602-606)

```typescript
<div className="flex items-center justify-center py-16">
  <AlertCircle className="h-8 w-8 text-destructive mb-4" />
  <p className="text-destructive mb-2">حدث خطأ في تحميل البيانات</p>
  <p className="text-sm text-primary-foreground/85">{productsError?.message || categoriesError?.message}</p>
</div>
```

### 5.2 تحليل كيفية معالجة الخطأ

#### في useProducts.ts (السطور 38-40):
```typescript
if (error) {
  throw new Error(`فشل في جلب المنتجات: ${error.message}`);
}
```

#### في useCategories.ts (السطور 27-29):
```typescript
if (error) {
  throw new Error(`فشل في جلب التصنيفات: ${error.message}`);
}
```

### 5.3 مسار رسالة الخطأ

1. Supabase يُرجع خطأ (مثلاً: "Failed to fetch" أو "Permissions denied")
2. Hook يُغلف الخطأ في رسالة عربية: `فشل في جلب المنتجات: ${error.message}`
3. React Query يُمرر الخطأ إلى `productsError`
4. الصفحة تعرض: `productsError?.message`

**النتيجة:**
- ✅ رسالة Supabase الأصلية تُعرض جزئياً (في `error.message`)
- ✅ الرسالة العامة "حدث خطأ في تحميل البيانات" هي عنوان فقط
- ✅ التفاصيل الفعلية موجودة في `productsError?.message`

---

## 6. كيفية استخراج الخطأ الفعلي

### 6.1 من Console في المتصفح
1. افتح موقع Vercel
2. اضغط F12 لفتح Developer Tools
3. انقر على Console tab
4. ابحث عن:
   - رسائل خطأ حمراء
   - "فشل في جلب المنتجات: ..."
   - "فشل في جلب التصنيفات: ..."
   - أخطاء شبكة (Network errors)

### 6.2 من Network Tab
1. افتح Network tab
2. انقر على الفلتر "Fetch/XHR"
3. ابحث عن طلبات إلى Supabase (يبدأ بـ `rgnpxovzbwzfofbbsaja.supabase.co`)
4. انقر على الطلب الفاشل
5. اقرأ Response أو Status Code

### 6.3 من Vercel Logs
1. اذهب إلى Vercel Dashboard
2. اختر المشروع
3. انقر على "Logs"
4. اختر إطار زمني (مثل آخر ساعة)
5. ابحث عن أخطاء

---

## 7. السبب الأقرب بناءً على الأدلة

### 7.1 القواعد المستنتجة من الفحص

✅ **القاعدة 1:** الكود يستخدم `import.meta.env['VITE_*']` فقط
✅ **القاعدة 2:** لا يوجد استخدام `process.env`
✅ **القاعدة 3:** الكود مصمم للعمل في Browser فقط
✅ **القاعدة 4:** جميع دوال تحميل البيانات تُنفذ client-side
✅ **القاعدة 5:** لا يوجد server-side data fetching

### 7.2 ما هذا يعني؟
بما أن:
- الكود يستخدم `VITE_*` متغيرات فقط
- ويعمل client-side فقط
- وVite يحقن `VITE_*` متغيرات في bundle للعميل

إذن المشكلة **ليست** في:
- ❌ عدم حقن المتغيرات في bundle (لأن Vite يفعل هذا تلقائياً)
- ❌ حاجة متغيرات Server منفصلة
- ❌ استخدام Client في Server

### 7.3 السبب الأقرب المحتمل

**السبب الأرجح: سياسات RLS (Row Level Security) في Supabase تمنع الوصول.**

**الأدلة:**
1. الكود صحيح من ناحية متغيرات البيئة
2. الكود صحيح من ناحية SSR
3. استخدام React Query الصحيح
4. إذا كان الكود صحيح والخطأ يحدث في الوصول للبيانات، فالمشكلة في قاعدة البيانات نفسها

### 7.4 أنواع أخطاء RLS المحتملة

#### أ) سياسة RLS مفقودة أو غير مفعلة
- **الخطأ المتوقع:** `Permissions denied` أو `403 Forbidden`
- **السبب:** الجدول بدون سياسة RLS قد لا يسمح بالوصول للعميل

#### ب) سياسة RLS تمنع role 'anon'
- **الخطأ المتوقع:** `Permissions denied` أو `403 Forbidden`
- **السبب:** السياسة تسمح فقط بـ `authenticated` و تمنع `anon`

#### ج) سياسة RLS تمنع SELECT
- **الخطأ المتوقع:** `Permissions denied` أو `403 Forbidden`
- **السبب:** السياسة تسمح بـ INSERT/UPDATE فقط وليس SELECT

#### د) الجدول غير موجود
- **الخطأ المتوقع:** `relation "products" does not exist`
- **الاحتمال:** منخفض (الجداول موجودة من الاستيراد)

#### هـ) العمود `is_active` غير موجود
- **الخطأ المتوقع:** `column "is_active" does not exist`
- **الاحتمال:** منخفض (العمود موجود حسب الـ types)

### 7.5 سبب آخر محتمل: المتغيرات البيئية غير صحيحة في Vercel

**السيناريو:**
- المتغيرات أُضيفت في Vercel
- لكن القيم غير صحيحة (مثلاً URL خاطئ أو Anon Key خاطئ)
- في هذه الحالة، Supabase سيرمي خطأ مثل "Invalid API key" أو "Invalid URL"

**الاحتمال:** متوسط (إذا قمت بنسخ القيم يدوياً وقد يكون هناك خطأ في النسخ)

---

## 8. الملفات المسؤولة وأرقام الأسطر

### 8.1 الملفات الرئيسية
1. **src/lib/supabase.ts** (السطور 1-28)
   - السطر 17-18: قراءة متغيرات البيئة
   - السطر 7-11: حماية SSR

2. **src/lib/use-products.ts** (السطور 26-50)
   - السطر 30: استدعاء getSupabaseClient()
   - السطور 32-36: الاستعلام عن المنتجات
   - السطر 38-40: معالجة الخطأ

3. **src/lib/use-categories.ts** (السطور 15-44)
   - السطر 19: استدعاء getSupabaseClient()
   - السطور 21-25: الاستعلام عن التصنيفات
   - السطر 27-29: معالجة الخطأ

4. **src/routes/index.tsx** (السطور 602-606)
   - السطر 604: عرض رسالة الخطأ العامة
   - السطر 605: عرض تفاصيل الخطأ

### 8.2 ملفات الثانوية
5. **vite.config.ts** (السطور 12-21)
   - السطر 20: `envDir: "."` - يحدد مكان ملفات .env

6. **package.json** (السطر 48)
   - `@supabase/supabase-js: "^2.119.0"` - إصدار المكتبة

---

## 9. ملخص السبب الأقرب مع الأدلة

### التشخيص النهائي:

**السبب الأرجح: سياسات RLS (Row Level Security) في Supabase تمنع الوصول للعميل (anon role).**

**الأدلة:**
1. ✅ الكود يستخدم `import.meta.env['VITE_*']` فقط (صحيح لـ Vite client-side)
2. ✅ لا يوجد استخدام `process.env` (لا حاجة لمتغيرات Server)
3. ✅ الكود يمنع الاستخدام في SSR (صحيح للـ Supabase Client)
4. ✅ جميع دوال تحميل البيانات تُنفذ client-side (React Query)
5. ✅ رسالة الخطأ تُعرض تفاصيل Supabase الأصلية (`error.message`)
6. ✅ المتغيرات البيئية صحيحة من ناحية البنية
7. ❌ المشكلة الوحيدة المتبقية هي في قاعدة البيانات (RLS)

### السبب الثاني المحتمل (أقل احتمالاً):
**القيم غير صحيحة للمتغيرات البيئية في Vercel.**

**الأدلة:**
- إذا تم نسخ القيم يدوياً قد يكون هناك خطأ
- لكن هذا سيُظهر في Console كخطأ Supabase واضح

---

## 10. كيفية حل المشكلة

### الحل 1: تحقق من سياسات RLS في Supabase (موصى به)
1. اذهب إلى Supabase Dashboard
2. فتح Authentication → Policies
3. اختبر جدول `products`:
   - هل توجد سياسة SELECT لـ `anon`؟
   - هل السياسة مفعلة؟
4. اختبر جدول `categories`:
   - هل توجد سياسة SELECT لـ `anon`؟
   - هل السياسة مفعلة؟

إذا لم توجد سياسات، أضف:
```sql
-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policy for anon role
CREATE POLICY "Enable read access for all users" ON products
FOR SELECT TO anon
USING (true);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON categories
FOR SELECT TO anon
USING (true);
```

### الحل 2: تحقق من القيم في Vercel
1. اذهب إلى Vercel Dashboard
2. افتح Project Settings → Environment Variables
3. تأكد من أن:
   - `VITE_SUPABASE_URL` يحتوي URL صحيح (يبدأ بـ `https://`)
   - `VITE_SUPABASE_ANON_KEY` يحتوي key صحيح (يبدأ بـ `sb_publishable_`)

### الحل 3: فحص Console في المتصفح
1. افتح موقع Vercel
2. اضغط F12 → Console
3. ابحث عن رسالة الخطأ الفعلية
4. هذه الرسالة ستوضح السبب بشكل قاطع

---

## 11. الخطوات التالية الموصى بها

### خطوة 1: فحص Console (الأهم)
افتح موقع Vercel واضغط F12، ورسالة الخطأ الفعلية ستظهر في Console.

### خطوة 2: تحقق من RLS في Supabase
اذهب إلى Supabase Dashboard وتحقق من سياسات RLS للجداول `products` و `categories`.

### خطوة 3: تحقق من القيم في Vercel
تأكد من أن المتغيرات البيئية في Vercel تحتوي قيم صحيحة.

---

## 12. ملاحظات أمنية

✅ **لم يتم عرض أي مفاتيح أو قيم سرية**
✅ **لم يتم تعديل أي ملفات**
✅ **لم يتم تنفيذ أي عمليات على قاعدة البيانات**

---

**التقرير جاهز.** السبب الأرجح هو سياسات RLS في Supabase. يرجى:
1. فحص Console في المتصفح لتأكيد السبب
2. تحقق من سياسات RLS في Supabase Dashboard
3. إخباري برسالة الخطأ الفعلية من Console
