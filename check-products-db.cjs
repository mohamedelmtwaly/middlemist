const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

console.log('='.repeat(80));
console.log('فحص جدول products في Supabase (قراءة فقط)');
console.log('='.repeat(80));

// Load environment variables (using Anon Key for read-only access)
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('✗ خطأ: متغيرات البيئة غير موجودة');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'موجود' : 'مفقود');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'موجود' : 'مفقود');
  process.exit(1);
}

console.log('\nإعدادات Supabase:');
console.log(`  URL: ${supabaseUrl}`);
console.log(`  Anon Key: ${supabaseAnonKey.substring(0, 20)}...`);

// Create Supabase client with Anon Key (read-only for public data)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Load product-image-mapping.json
const mappingPath = path.join(__dirname, 'product-image-mapping.json');
const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));

console.log(`\nعدد المنتجات في product-image-mapping.json: ${mapping.length}`);

async function checkProducts() {
  try {
    console.log('\nجاري الاتصال بـ Supabase...');

    // Get all products (including inactive for analysis)
    const { data: allProducts, error: allError } = await supabase
      .from('products')
      .select('*')
      .order('name', { ascending: true });

    if (allError) {
      console.error('\n✗ خطأ في جلب المنتجات:');
      console.error(allError.message);
      return;
    }

    console.log(`\n✓ تم جلب المنتجات بنجاح`);
    console.log(`إجمالي المنتجات في قاعدة البيانات: ${allProducts.length}`);

    if (allProducts.length === 0) {
      console.log('\nالجدول فارغ حاليًا');
      return;
    }

    // Analyze columns
    console.log('\n' + '='.repeat(80));
    console.log('الأعمدة الموجودة في جدول products:');
    console.log('='.repeat(80));
    const columns = Object.keys(allProducts[0]);
    columns.forEach(col => console.log(`  - ${col}`));

    // Analyze image_url
    console.log('\n' + '='.repeat(80));
    console.log('تحليل image_url:');
    console.log('='.repeat(80));
    const withImage = allProducts.filter(p => p.image_url && p.image_url.trim() !== '');
    const withoutImage = allProducts.filter(p => !p.image_url || p.image_url.trim() === '');
    console.log(`المنتجات التي لديها image_url: ${withImage.length}`);
    console.log(`المنتجات بدون image_url: ${withoutImage.length}`);

    // Analyze active products
    const activeProducts = allProducts.filter(p => p.is_active);
    const inactiveProducts = allProducts.filter(p => !p.is_active);
    console.log(`\nالمنتجات النشطة (is_active = true): ${activeProducts.length}`);
    console.log(`المنتجات غير النشطة (is_active = false): ${inactiveProducts.length}`);

    // Show sample products
    console.log('\n' + '='.repeat(80));
    console.log('عينة من المنتجات (أول 10):');
    console.log('='.repeat(80));
    allProducts.slice(0, 10).forEach((p, i) => {
      console.log(`\n${i + 1}. ${p.name}`);
      console.log(`   ID: ${p.id}`);
      console.log(`   Category: ${p.category}`);
      console.log(`   Image URL: ${p.image_url || '(فارغ)'}`);
      console.log(`   Active: ${p.is_active}`);
    });

    // Try to match with mapping
    console.log('\n' + '='.repeat(80));
    console.log('محاولة مطابقة أسماء المنتجات مع product-image-mapping.json:');
    console.log('='.repeat(80));

    const dbProductNames = new Set(allProducts.map(p => p.name));
    const mappingProductNames = new Set(mapping.map(m => m['اسم المنتج']));

    const matches = [];
    const dbOnly = [];
    const mappingOnly = [];

    // Check each mapping product
    mapping.forEach(m => {
      const name = m['اسم المنتج'];
      if (dbProductNames.has(name)) {
        matches.push(name);
      } else {
        mappingOnly.push(name);
      }
    });

    // Check each DB product
    allProducts.forEach(p => {
      if (!mappingProductNames.has(p.name)) {
        dbOnly.push(p.name);
      }
    });

    console.log(`\nالمنتجات الموجودة في كلا الجانبين (يمكن تحديث صورها): ${matches.length}`);
    console.log(`المنتجات الموجودة فقط في قاعدة البيانات: ${dbOnly.length}`);
    console.log(`المنتجات الموجودة فقط في mapping: ${mappingOnly.length}`);

    // Check for duplicates in DB
    console.log('\n' + '='.repeat(80));
    console.log('فحص التكرار في أسماء المنتجات في قاعدة البيانات:');
    console.log('='.repeat(80));
    const nameCounts = {};
    allProducts.forEach(p => {
      nameCounts[p.name] = (nameCounts[p.name] || 0) + 1;
    });
    const duplicates = Object.entries(nameCounts).filter(([name, count]) => count > 1);
    if (duplicates.length > 0) {
      console.log(`\nوجد ${duplicates.length} اسم مكرر:`);
      duplicates.forEach(([name, count]) => {
        console.log(`  - "${name}" (${count} مرات)`);
        // Show IDs
        const dupProducts = allProducts.filter(p => p.name === name);
        dupProducts.forEach(p => {
          console.log(`    ID: ${p.id}, Image: ${p.image_url || '(فارغ)'}`);
        });
      });
    } else {
      console.log('\nلا يوجد تكرار في أسماء المنتجات');
    }

    // Check for "استاند" specifically
    console.log('\n' + '='.repeat(80));
    console.log('فحص المنتج "استاند":');
    console.log('='.repeat(80));
    const standProducts = allProducts.filter(p => p.name === 'استاند');
    if (standProducts.length > 0) {
      console.log(`\nوجد ${standProducts.length} منتج باسم "استاند":`);
      standProducts.forEach(p => {
        console.log(`  ID: ${p.id}`);
        console.log(`  Image URL: ${p.image_url || '(فارغ)'}`);
        console.log(`  Active: ${p.is_active}`);
      });
    } else {
      console.log('\nلم يتم العثور على منتج باسم "استاند"');
    }

    // Check mapping for "استاند"
    const standMapping = mapping.find(m => m['اسم المنتج'] === 'استاند');
    if (standMapping) {
      console.log(`\nفي product-image-mapping.json:`);
      console.log(`  اسم المنتج: ${standMapping['اسم المنتج']}`);
      console.log(`  اسم الصورة: ${standMapping['اسم الصورة بالإنجليزي (بدون الامتداد)']}.webp`);
      console.log(`  URL المقترح: ${supabaseUrl}/storage/v1/object/public/product-images/products/${standMapping['اسم الصورة بالإنجليزي (بدون الامتداد)']}.webp`);
    }

    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('ملخص الفحص:');
    console.log('='.repeat(80));
    console.log(`إجمالي المنتجات في قاعدة البيانات: ${allProducts.length}`);
    console.log(`المنتجات النشطة: ${activeProducts.length}`);
    console.log(`المنتجات بـ image_url: ${withImage.length}`);
    console.log(`المنتجات بدون image_url: ${withoutImage.length}`);
    console.log(`المنتجات المطابقة مع mapping: ${matches.length}`);
    console.log(`المنتجات في DB فقط: ${dbOnly.length}`);
    console.log(`المنتجات في mapping فقط: ${mappingOnly.length}`);
    console.log(`الأسماء المكررة في DB: ${duplicates.length}`);

    console.log('\n' + '='.repeat(80));

  } catch (error) {
    console.error('\n✗ خطأ غير متوقع:');
    console.error(error.message);
  }
}

checkProducts();
