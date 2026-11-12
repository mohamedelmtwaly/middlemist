const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

console.log('='.repeat(80));
console.log('سكريبت تنفيذ استبدال كتالوج منتجات Middlemist');
console.log('='.repeat(80));

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('✗ VITE_SUPABASE_URL أو SUPABASE_SECRET_KEY غير موجود في .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeMigration() {
  try {
    console.log('\nجاري تحميل المنتجات...');

    // Load products
    const productsPath = path.join(__dirname, 'products-transformed-null-images.json');
    const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

    // Validate 1: productsData must be an array with exactly 348 products
    if (!Array.isArray(productsData)) {
      console.error('✗ productsData ليس مصفوفة');
      process.exit(1);
    }
    if (productsData.length !== 348) {
      console.error(`✗ عدد المنتجات غير صحيح: ${productsData.length} (المتوقع: 348)`);
      process.exit(1);
    }

    console.log(`✓ تم تحميل ${productsData.length} منتج`);

    // Count and validate image_url distribution
    const nullImages = productsData.filter(p => p.image_url === null).length;
    const validImages = productsData.filter(p => typeof p.image_url === 'string' && p.image_url.trim() !== '').length;
    const invalidImages = productsData.filter(p => p.image_url !== null && (typeof p.image_url !== 'string' || p.image_url.trim() === '')).length;

    console.log(`  - ${validImages} منتج بصورة صحيحة (نص غير فارغ)`);
    console.log(`  - ${nullImages} منتج بimage_url = null`);
    console.log(`  - ${invalidImages} منتج بقيمة image_url غير صحيحة`);

    // Validate 2: null images must be exactly 54
    if (nullImages !== 54) {
      console.error(`✗ عدد المنتجات بimage_url = null غير صحيح: ${nullImages} (المتوقع: 54)`);
      process.exit(1);
    }

    // Validate 3: valid images must be exactly 294
    if (validImages !== 294) {
      console.error(`✗ عدد المنتجات بصورة صحيحة غير صحيح: ${validImages} (المتوقع: 294)`);
      process.exit(1);
    }

    // Validate 4: reject any invalid image_url values (not string, empty string, whitespace, number, boolean, object)
    if (invalidImages > 0) {
      console.error(`✗ يوجد ${invalidImages} منتج بقيمة image_url غير صحيحة`);
      const invalidList = productsData.filter(p => p.image_url !== null && (typeof p.image_url !== 'string' || p.image_url.trim() === ''));
      invalidList.forEach(p => console.error(`  - ${p.name}: ${typeof p.image_url} (${p.image_url})`));
      process.exit(1);
    }

    // Validate 5: legacy_id must be null for all products
    const nonNullLegacyIds = productsData.filter(p => p.legacy_id !== null);
    if (nonNullLegacyIds.length > 0) {
      console.error(`✗ يوجد ${nonNullLegacyIds.length} منتج بlegacy_id غير null`);
      nonNullLegacyIds.forEach(p => console.error(`  - ${p.name}: ${p.legacy_id}`));
      process.exit(1);
    }

    // Validate 6: each product must have name, category, and category_id
    const missingFields = [];
    productsData.forEach((p, index) => {
      if (!p.name || p.name === '') {
        missingFields.push(`المنتج ${index + 1}: مفقود name`);
      }
      if (!p.category || p.category === '') {
        missingFields.push(`المنتج ${index + 1} (${p.name || 'بدون اسم'}): مفقود category`);
      }
      if (!p.category_id || p.category_id === '') {
        missingFields.push(`المنتج ${index + 1} (${p.name || 'بدون اسم'}): مفقود category_id`);
      }
    });

    if (missingFields.length > 0) {
      console.error('✗ يوجد حقول مفقودة:');
      missingFields.forEach(f => console.error(`  - ${f}`));
      process.exit(1);
    }

    console.log('\n✓ جميع الفحوصات المحلية نجحت');
    console.log('جاري استدعاء دالة replace_products_catalog...');

    // Call the function
    const { data, error } = await supabase
      .rpc('replace_products_catalog', { new_products: productsData });

    if (error) {
      console.error('\n✗ فشل التنفيذ:');
      console.error(JSON.stringify(error, null, 2));
      process.exit(1);
    }

    console.log('\n✓ نجح التنفيذ:');
    console.log(JSON.stringify(data, null, 2));

    console.log('\n' + '='.repeat(80));
    console.log('يرجى التحقق من قاعدة البيانات للتأكد من النتائج');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('\n✗ خطأ غير متوقع:');
    console.error(error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

executeMigration();
