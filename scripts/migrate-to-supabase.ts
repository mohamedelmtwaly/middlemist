/**
 * سكريبت نقل المنتجات من store-data.ts إلى Supabase
 *
 * ينفذ:
 * 1. مصادقة المالك (elmtwaly71@gmail.com)
 * 2. قراءة التصنيفات الموجودة (12 تصنيف)
 * 3. رفع الصور (32 صورة: 28 فريدة + 4 عامة) إلى Storage bucket "product-images"
 * 4. إدخال المنتجات (180 منتج) مع الروابط العامة للصور
 *
 * المتطلبات قبل التشغيل:
 * - وجود جدول categories في Supabase (12 تصنيف)
 * - وجود جدول products في Supabase مع عمود legacy_id
 * - وجود Storage bucket "product-images" في Supabase
 * - سياسات RLS تسمح للمالك بالكتابة
 *
 * مميزات:
 * - Idempotent: يمكن إعادة التشغيل دون تكرار البيانات
 * - منع التكرار: يستخدم legacy_id (p0-p179) للتحقق
 * - معالجة الأخطاء: يتوقف عند أول خطأ
 * - يستخدم Publishable Key مع مصادقة المستخدم
 * - لا يستخدم Service Role Key
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import readline from 'readline';

// تحميل متغيرات البيئة من .env.local فقط
dotenv.config({ path: '.env.local' });

// بيانات المتغيرات البيئية
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ خطأ: يجب تعيين VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY في .env');
  process.exit(1);
}

// إنشاء Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// UUID المالك
const OWNER_UUID = 'e425941c-110b-438a-a6bf-22edb65b7507';
const OWNER_EMAIL = 'elmtwaly71@gmail.com';

// البيانات المستوردة من store-data.ts
const categories = [
  "مسكات العروس", "باقات الورد", "باقات المناسبات", "بوكسات الهدايا", "الفازات", "الأستاندات",
  "سلات الورد", "الورد والشوكولاتة", "باقات الورد والهدايا", "البالونات", "الدباديب", "الطباعة والإضافات",
];

const raw: [string, string, number, string][] = [
  ["مسكة عروس طبيعي", "مسكات العروس", 420, "bridal"],
  ["مسكة عروس صناعي", "مسكات العروس", 280, "bridal"],
  ["فازة العروسة", "مسكات العروس", 350, "vase"],
  ["باقة جوري أحمر", "باقات الورد", 260, "box"],
  ["باقة ورد أبيض", "باقات الورد", 240, "bridal"],
  ["باقة كازابلانكا", "باقات الورد", 330, "hero"],
  ["بوكيه باستيل", "باقات الورد", 290, "vase"],
  ["باقة عيد ميلاد", "باقات المناسبات", 270, "vase"],
  ["باقة تخرج", "باقات المناسبات", 300, "hero"],
  ["باقة مواليد", "باقات المناسبات", 280, "vase"],
  ["باقة شكر واعتذار", "باقات المناسبات", 220, "hero"],
  ["بوكس ورد طبيعي", "بوكسات الهدايا", 310, "box"],
  ["بوكس كندر", "بوكسات الهدايا", 190, "box"],
  ["فازة ورد طبيعي", "الفازات", 340, "vase"],
  ["فازة مواليد", "الفازات", 300, "vase"],
  ["أستاند ملكي", "الأستاندات", 650, "hero"],
  ["أستاند أكريليك", "الأستاندات", 520, "bridal"],
  ["سلة ورد طبيعي", "سلات الورد", 360, "hero"],
  ["سلة مواليد", "سلات الورد", 330, "vase"],
  ["روز شوكلت باتشي", "الورد والشوكولاتة", 420, "box"],
  ["ورد مع دبدوب", "باقات الورد والهدايا", 350, "vase"],
  ["ورد مع سلسال فضة", "باقات الورد والهدايا", 480, "box"],
  ["بالونات هيليوم", "البالونات", 90, "vase"],
  ["بالونات أرقام وحروف", "البالونات", 120, "vase"],
  ["دبدوب متوسط", "الدباديب", 150, "vase"],
  ["دبدوب استيتش", "الدباديب", 180, "vase"],
  ["طباعة أكريليك", "الطباعة والإضافات", 80, "bridal"],
  ["تغريسات مطبوعة", "الطباعة والإضافات", 40, "hero"],
];

const bouquets = [
  { id: "b1", name: "باقة الحلم الوردي", category: "باقات الورد", price: 320, desc: "جوري بيبي روز وفاوانيا بيضاء مع أوكالبتوس" },
  { id: "b2", name: "مسكة العروس الملكية", category: "مسكات العروس", price: 450, desc: "جوري أبيض طبيعي مع جبسوفيلا وشريطة ساتان" },
  { id: "b3", name: "بوكس الجوري والشوكولاتة", category: "الورد والشوكولاتة", price: 380, desc: "جوري أحمر مع تشكيلة شوكولاتة فاخرة" },
  { id: "b4", name: "فازة الباستيل والدبدوب", category: "باقات الورد والهدايا", price: 410, desc: "فازة باستيل مع دبدوب وبالونات" },
];

const more: Record<string, [string, number][]> = {
  "مسكات العروس": [["مسكة الجوري الأبيض الكلاسيكية", 450], ["مسكة الفاوانيا الوردية", 520], ["مسكة الأوركيد الشلال", 690], ["مسكة الجبسوفيلا الناعمة", 260], ["مسكة الكالا الملكية", 480], ["مسكة البيبي روز", 410], ["مسكة الأوكالبتوس البوهيمية", 390], ["مسكة الليليوم البيضاء", 430], ["مسكة الكوشة الكريمية", 470], ["مسكة الجوري المشكّل", 440], ["مسكة الإشبينة الصغيرة", 180], ["مسكة عروس مع لؤلؤ", 560], ["مسكة الملكة الفخمة", 750]],
  "باقات الورد": [["باقة 50 جوري أحمر", 520], ["باقة 100 جوري", 950], ["باقة التوليب الهولندي", 380], ["باقة الفاوانيا", 420], ["باقة دوار الشمس", 230], ["باقة الليليوم", 280], ["باقة الجوري الوردي", 270], ["باقة الأوركيد", 360], ["باقة الجبسوفيلا", 190], ["باقة الكالا", 310], ["باقة الربيع المشكّلة", 250]],
  "باقات المناسبات": [["باقة نجاح", 290], ["باقة يوم الأم", 300], ["باقة سلامتك", 240], ["باقة رمضان كريم", 280], ["باقة العيد", 300], ["باقة يوم التأسيس", 310], ["باقة اليوم الوطني", 310], ["باقة ترقية", 330], ["باقة ذكرى زواج", 380], ["باقة خطوبة", 400], ["باقة افتتاح", 450]],
  "بوكسات الهدايا": [["بوكس الجوري القلب", 420], ["بوكس دائري فخم", 360], ["بوكس مرآة مع ورد", 390], ["بوكس عطر وورد", 520], ["بوكس مواليد أزرق", 340], ["بوكس مواليد وردي", 340], ["بوكس الشكر", 250], ["بوكس عيد ميلاد", 320], ["بوكس الجوري المجفف", 290], ["بوكس الحروف", 380], ["بوكس مخملي أسود", 450], ["بوكس صغير مع كرت", 160], ["بوكس الهدايا الفاخر", 600]],
  "الفازات": [["فازة زجاجية جوري", 320], ["فازة سيراميك بيضاء", 360], ["فازة التوليب", 390], ["فازة الأوركيد", 450], ["فازة دوار الشمس", 280], ["فازة الليليوم", 340], ["فازة كريستال فخمة", 620], ["فازة ذهبية", 480], ["فازة صغيرة للمكتب", 190], ["فازة الربيع", 300], ["فازة الكالا", 370], ["فازة البيبي روز", 330], ["فازة ملكية كبيرة", 700]],
  "الأستاندات": [["أستاند افتتاح كبير", 900], ["أستاند تهنئة", 580], ["أستاند تخرج", 560], ["أستاند مواليد", 600], ["أستاند زواج", 750], ["أستاند دائري", 640], ["أستاند الجوري الأحمر", 700], ["أستاند أبيض فخم", 820], ["أستاند بطابقين", 1100], ["أستاند مع اسم مطبوع", 680], ["أستاند الشكر", 520], ["أستاند صغير", 380], ["أستاند الأوركيد", 950]],
  "سلات الورد": [["سلة جوري أحمر", 380], ["سلة الربيع", 320], ["سلة دوار الشمس", 300], ["سلة الفاكهة والورد", 450], ["سلة الأوركيد", 480], ["سلة بيضاء فخمة", 420], ["سلة الشوكولاتة والورد", 460], ["سلة صغيرة ناعمة", 210], ["سلة التوليب", 390], ["سلة مواليد وردية", 350], ["سلة مواليد زرقاء", 350], ["سلة الشفاء", 290], ["سلة القهوة والورد", 410]],
  "الورد والشوكولاتة": [["جوري مع فيريرو", 320], ["جوري مع شوكولاتة جاليري", 390], ["بوكس قلب شوكولاتة", 350], ["باقة شوكولاتة كندر", 260], ["صينية ورد وشوكولاتة", 480], ["فازة شوكولاتة", 420], ["جوري مع ليندت", 370], ["باقة سنيكرز وورد", 240], ["بوكس باتشي صغير", 280], ["سلة شوكولاتة فاخرة", 550], ["ورد مع رافاييلو", 330], ["تشكيلة شوكولاتة ملكية", 600], ["ورد مع تمر محشي", 340], ["علبة شوكولاتة ورد مجفف", 300]],
  "باقات الورد والهدايا": [["ورد مع عطر", 520], ["ورد مع ساعة", 650], ["ورد مع شمعة معطرة", 310], ["ورد مع مج مطبوع", 260], ["ورد مع إطار صورة", 340], ["ورد مع محفظة", 480], ["ورد مع خاتم فضة", 520], ["ورد مع مصحف", 380], ["ورد مع بالونة", 290], ["ورد مع كيك", 420], ["ورد مع بخور", 360], ["ورد مع أسوارة", 500], ["ورد مع ميدالية اسم", 280]],
  "البالونات": [["بالونات قلوب", 140], ["بالونة شفافة بالورد", 180], ["بالونات تخرج", 160], ["بالونات مواليد", 150], ["بالونات ذهبية", 130], ["بالونة عملاقة", 220], ["قوس بالونات", 450], ["بالونات عيد ميلاد", 140], ["بالونات مع اسم", 170], ["بوكيه بالونات", 200], ["بالونات كروم", 160], ["بالونة نجمة", 70], ["بالونات مفاجأة", 190]],
  "الدباديب": [["دبدوب كبير", 280], ["دبدوب عملاق", 450], ["دبدوب صغير", 80], ["دبدوب مع قلب", 160], ["دبدوب تخرج", 140], ["دبدوب أبيض", 170], ["دبدوب وردي", 170], ["دبدوب مع ورد", 260], ["دبدوب مطبوع باسم", 190], ["دبدوب الباندا", 180], ["دبدوب الأرنب", 150], ["دبدوب مواليد", 130], ["دبدوب بطانية", 220]],
  "الطباعة والإضافات": [["كرت إهداء مطبوع", 25], ["مج مطبوع", 60], ["مناديل مطبوعة", 45], ["إطار أكريليك", 120], ["درع تكريم", 250], ["لوحة أكريليك باسم", 150], ["ستيكرات مطبوعة", 30], ["شريطة ساتان مطبوعة", 35], ["توزيعات مطبوعة", 90], ["لوحة ترحيب", 300], ["ميدالية أكريليك", 40], ["علبة توزيعات", 70], ["مرآة مطبوعة", 180]],
};

// خريطة الصور الفريدة
const photoMapping: Record<string, string> = {
  "مسكة عروس طبيعي": "bridal-natural.jpg",
  "مسكة عروس صناعي": "bridal-artificial.jpg",
  "فازة العروسة": "bridal-vase.jpg",
  "باقة جوري أحمر": "red-rose.jpg",
  "باقة ورد أبيض": "white-rose.jpg",
  "باقة كازابلانكا": "casablanca.jpg",
  "بوكيه باستيل": "pastel.jpg",
  "باقة عيد ميلاد": "birthday.jpg",
  "باقة تخرج": "graduation.jpg",
  "باقة مواليد": "newborn.jpg",
  "باقة شكر واعتذار": "thankyou.jpg",
  "بوكس ورد طبيعي": "gift-box-rose.jpg",
  "بوكس كندر": "kinder-box.jpg",
  "فازة ورد طبيعي": "natural-vase.jpg",
  "فازة مواليد": "newborn-vase.jpg",
  "أستاند ملكي": "royal-stand.jpg",
  "أستاند أكريليك": "acrylic-stand.jpg",
  "سلة ورد طبيعي": "flower-basket.jpg",
  "سلة مواليد": "newborn-basket.jpg",
  "روز شوكلت باتشي": "rose-chocolate.jpg",
  "ورد مع دبدوب": "roses-teddy.jpg",
  "ورد مع سلسال فضة": "roses-necklace.jpg",
  "بالونات هيليوم": "helium-balloons.jpg",
  "بالونات أرقام وحروف": "number-balloons.jpg",
  "دبدوب متوسط": "teddy-medium.jpg",
  "دبدوب استيتش": "stitch-teddy.jpg",
  "طباعة أكريليك": "acrylic-print.jpg",
  "تغريسات مطبوعة": "printed-tags.jpg",
};

// الصور العامة للمشاركة
const commonImages = {
  hero: "hero.jpg",
  bridal: "bridal.jpg",
  box: "box.jpg",
  vase: "vase.jpg",
};

// إنشاء قائمة المنتجات الكاملة
function generateProducts() {
  const base = raw.map(([name, category, price, imageType]) => ({
    name,
    category,
    price,
    imageType,
  }));

  const extra = categories.flatMap((category) => {
    const imgs = base.filter((p) => p.category === category).map((p) => p.imageType);
    const have = imgs.length;
    return (more[category] ?? []).slice(0, Math.max(0, 15 - have)).map(([name, price], i) => ({
      name,
      category,
      price,
      imageType: imgs[i % imgs.length] ?? 'hero',
    }));
  });

  const allProducts = [...base, ...extra].map((p, i) => ({
    id: `p${i}`,
    ...p,
  }));

  // إضافة الوصف للمنتجات الأساسية من bouquets
  bouquets.forEach((bouquet) => {
    const index = allProducts.findIndex((p) => p.name === bouquet.name);
    if (index !== -1) {
      allProducts[index].desc = bouquet.desc;
    }
  });

  return allProducts;
}

// قراءة المدخلات من المستخدم
function askQuestion(query: string, hidden: boolean = false): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    if (hidden) {
      // إخفاء كلمة المرور
      const stdin = process.stdin;
      const stdout = process.stdout;
      stdout.write(query);
      stdin.setRawMode(true);
      stdin.resume();
      stdin.setEncoding('utf8');

      let password = '';
      stdin.on('data', (char) => {
        if (char === '\n' || char === '\r' || char === '\u0004') {
          stdin.setRawMode(false);
          stdin.pause();
          stdout.write('\n');
          rl.close();
          resolve(password);
        } else if (char === '\u0003') {
          // Ctrl+C
          process.exit();
        } else if (char === '\u007f') {
          // Backspace
          if (password.length > 0) {
            password = password.slice(0, -1);
            stdout.write('\b \b');
          }
        } else {
          password += char;
          stdout.write('*');
        }
      });
    } else {
      rl.question(query, (answer) => {
        rl.close();
        resolve(answer);
      });
    }
  });
}

// مصادقة المالك
async function authenticateOwner() {
  console.log('🔐 مصادقة المالك...\n');

  const email = await askQuestion('البريد الإلكتروني: ');
  const password = await askQuestion('كلمة المرور: ', true);

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('❌ فشل تسجيل الدخول:', error.message);
    throw error;
  }

  if (!data.user) {
    console.error('❌ لم يتم الحصول على بيانات المستخدم');
    throw new Error('No user data returned');
  }

  // التحقق من UUID المالك
  if (data.user.id !== OWNER_UUID) {
    console.error(`❌ UUID المستخدم (${data.user.id}) لا يطابق UUID المالك (${OWNER_UUID})`);
    throw new Error('User UUID does not match owner UUID');
  }

  // التحقق من البريد الإلكتروني
  if (data.user.email !== OWNER_EMAIL) {
    console.error(`❌ البريد الإلكتروني (${data.user.email}) لا يطابق بريد المالك (${OWNER_EMAIL})`);
    throw new Error('User email does not match owner email');
  }

  console.log(`✅ تمت المصادقة بنجاح: ${data.user.email}`);
  return data.user;
}

// قراءة التصنيفات الموجودة
async function fetchCategories() {
  console.log('\n📦 قراءة التصنيفات الموجودة...');

  const { data, error } = await supabase
    .from('categories')
    .select('id, name_ar')
    .order('sort_order');

  if (error) {
    console.error('❌ خطأ في قراءة التصنيفات:', error.message);
    throw error;
  }

  if (!data || data.length === 0) {
    console.error('❌ لم يتم العثور على تصنيفات في قاعدة البيانات');
    throw new Error('No categories found in database');
  }

  console.log(`✅ تم قراءة ${data.length} تصنيف`);

  // إنشاء خريطة name_ar -> id
  const categoryMap: Record<string, string> = {};
  for (const cat of data) {
    categoryMap[cat.name_ar] = cat.id;
  }

  return categoryMap;
}

// رفع الصور إلى Storage
async function uploadImages() {
  console.log('\n🖼️  رفع الصور إلى Storage bucket "product-images"...');

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const projectRoot = path.resolve(__dirname, '..');
  const productsDir = path.join(projectRoot, 'src/assets/products');
  const assetsDir = path.join(projectRoot, 'src/assets');

  // الصور الفريدة + الصور العامة
  const uniqueImages = [...new Set(Object.values(photoMapping))];
  const allImages = [...uniqueImages, ...Object.values(commonImages)];

  console.log(`ℹ️  إجمالي الصور: ${allImages.length} (28 فريدة + 4 عامة)`);

  for (const filename of allImages) {
    // التحقق من وجود الصورة في Storage (مطابقة اسم الملف بالكامل)
    const { data: existing, error: listError } = await supabase
      .storage
      .from('product-images')
      .list('', { search: filename });

    if (listError) {
      console.error(`❌ خطأ في البحث عن الصورة "${filename}":`, listError.message);
      throw listError;
    }

    if (existing && existing.length > 0) {
      // التحقق من تطابق الاسم بالكامل
      const exactMatch = existing.find((file: { name: string }) => file.name === filename);
      if (exactMatch) {
        console.log(`⏭️  الصورة "${filename}" موجودة بالفعل، تجاوز`);
        continue;
      }
    }

    // تحديد مسار الصورة
    let imagePath;
    if (uniqueImages.includes(filename)) {
      imagePath = path.join(productsDir, filename);
    } else {
      imagePath = path.join(assetsDir, filename);
    }

    // التحقق من وجود الملف محليًا
    if (!fs.existsSync(imagePath)) {
      console.error(`❌ الصورة "${filename}" غير موجودة في ${imagePath}`);
      throw new Error(`Image file not found: ${filename}`);
    }

    // قراءة الملف
    const fileBuffer = fs.readFileSync(imagePath);
    const fileSizeMB = fileBuffer.length / (1024 * 1024);

    if (fileSizeMB > 5) {
      console.error(`❌ الصورة "${filename}" أكبر من 5MB (${fileSizeMB.toFixed(2)}MB)`);
      throw new Error(`Image size exceeds 5MB: ${filename}`);
    }

    // رفع الصورة
    const { data, error } = await supabase
      .storage
      .from('product-images')
      .upload(filename, fileBuffer, {
        upsert: false,
        contentType: 'image/jpeg',
      });

    if (error) {
      console.error(`❌ خطأ في رفع الصورة "${filename}":`, error.message);
      throw error;
    }

    console.log(`✅ تم رفع الصورة "${filename}" (${fileSizeMB.toFixed(2)}MB)`);
  }

  console.log(`✅ تم رفع جميع الصور (${allImages.length} صورة)`);
}

// الحصول على URL عام للصورة
function getPublicUrl(filename: string): string {
  const { data } = supabase
    .storage
    .from('product-images')
    .getPublicUrl(filename);

  return data.publicUrl;
}

// إدخال المنتجات
async function insertProducts(categoryMap: Record<string, string>) {
  console.log('\n🛍️  إدخال المنتجات...');

  const products = generateProducts();
  console.log(`ℹ️  إجمالي المنتجات: ${products.length}`);

  let insertedCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < products.length; i++) {
    const product = products[i];

    // الحصول على category_id من الخريطة
    const categoryId = categoryMap[product.category];

    if (!categoryId) {
      console.error(`❌ التصنيف "${product.category}" غير موجود في قاعدة البيانات`);
      throw new Error(`Category not found: ${product.category}`);
    }

    // تحديد اسم ملف الصورة
    let imageFilename;
    if (photoMapping[product.name]) {
      imageFilename = photoMapping[product.name];
    } else {
      // الصور العامة (hero, bridal, box, vase)
      imageFilename = commonImages[product.imageType as keyof typeof commonImages] || commonImages.hero;
    }

    // الحصول على URL عام للصورة
    const imageUrl = getPublicUrl(imageFilename);

    // التحقق من وجود المنتج باستخدام legacy_id
    const { data: existing, error: checkError } = await supabase
      .from('products')
      .select('id')
      .eq('legacy_id', product.id)
      .maybeSingle();

    if (checkError) {
      console.error(`❌ خطأ في البحث عن المنتج "${product.name}":`, checkError.message);
      throw checkError;
    }

    if (existing) {
      console.log(`⏭️  المنتج "${product.name}" (legacy_id: ${product.id}) موجود بالفعل، تجاوز`);
      skippedCount++;
      continue;
    }

    // إدخال المنتج مع sort_order للحفاظ على الترتيب الأصلي
    const { data, error } = await supabase
      .from('products')
      .insert({
        name: product.name,
        category: product.category,
        category_id: categoryId,
        price: product.price,
        image_url: imageUrl,
        description: product.desc || null,
        is_active: true,
        legacy_id: product.id,
        sort_order: i + 1,
      })
      .select('id')
      .single();

    if (error) {
      console.error(`❌ خطأ في إدخال المنتج "${product.name}":`, error.message);
      throw error;
    }

    console.log(`✅ تم إدخال المنتج "${product.name}" (legacy_id: ${product.id})`);
    insertedCount++;
  }

  console.log(`✅ تم إدخال ${insertedCount} منتج جديد، تجاوز ${skippedCount} منتج موجود`);
}

// تسجيل الخروج
async function signOut() {
  await supabase.auth.signOut();
  console.log('\n👋 تم تسجيل الخروج');
}

// الدالة الرئيسية
async function main() {
  console.log('🚀 بدء سكريبت نقل المنتجات إلى Supabase...\n');

  try {
    // 1. مصادقة المالك
    const user = await authenticateOwner();

    // 2. قراءة التصنيفات الموجودة
    const categoryMap = await fetchCategories();

    // 3. رفع الصور
    await uploadImages();

    // 4. إدخال المنتجات
    await insertProducts(categoryMap);

    console.log('\n✅ ✅ ✅ تم النقل بنجاح! ✅ ✅ ✅\n');
    console.log('📊 ملخص:');
    console.log('   - 12 تصنيف (موجودة بالفعل)');
    console.log('   - 32 صورة (28 فريدة + 4 عامة)');
    console.log('   - 180 منتج');
    console.log('\n💡 يمكنك الآن تعديل الكود لقراءة البيانات من Supabase.');

  } catch (error) {
    console.error('\n❌ ❌ ❌ فشل النقل ❌ ❌ ❌\n');
    console.error('الخطأ:', error);
    process.exit(1);
  } finally {
    // تسجيل الخروج دائمًا، سواء نجح أو فشل
    await signOut();
  }
}

// تشغيل السكريبت
main();
