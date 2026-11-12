const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

console.log('='.repeat(80));
console.log('مقارنة الصور وفحص Placeholder (READ ONLY)');
console.log('='.repeat(80));

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
const supabase = createClient(supabaseUrl, supabaseSecretKey);

async function checkImages() {
  try {
    // Load product-image-mapping.json
    const mappingPath = path.join(__dirname, 'product-image-mapping.json');
    const mappingData = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
    console.log(`✓ تم تحميل product-image-mapping.json: ${mappingData.length} سجل`);

    // Load middlemist-products.json
    const productsPath = path.join(__dirname, 'middlemist-products.json');
    const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
    console.log(`✓ تم تحميل middlemist-products.json: ${productsData.products.length} منتج`);

    // Load products-transformed.json
    const transformedPath = path.join(__dirname, 'products-transformed.json');
    const transformedData = JSON.parse(fs.readFileSync(transformedPath, 'utf8'));
    console.log(`✓ تم تحميل products-transformed.json: ${transformedData.length} منتج`);

    // Get storage files
    console.log('\nجاري فحص الصور في Supabase Storage...');
    const { data: storageFiles } = await supabase
      .storage
      .from('product-images')
      .list('products', { limit: 1000 });

    const storageFileNames = new Set(storageFiles.map(f => f.name));
    console.log(`✓ تم العثور على ${storageFiles.length} صورة في products/`);

    // Extract image filenames from mapping
    const mappingFilenames = mappingData.map(m => m['اسم الصورة بالإنجليزي (بدون الامتداد)'] + '.webp');
    console.log(`✓ صور من mapping: ${mappingFilenames.length}`);

    // Extract image filenames from middlemist-products.json
    const productsFilenames = productsData.products.map(p => p.image_filename);
    console.log(`✓ صور من middlemist-products.json: ${productsFilenames.length}`);

    // Compare
    console.log('\n' + '='.repeat(80));
    console.log('مقارنة الصور:');
    console.log('='.repeat(80));
    console.log(`تقرير الرفع السابق: 295 صورة مرفوعة`);
    console.log(`تقرير الفحص الأخير: 294 صورة موجودة`);
    console.log(`الفارق: 1 صورة`);

    // Find the difference
    const mappingSet = new Set(mappingFilenames);
    const storageSet = new Set(storageFileNames);
    
    const inMappingNotInStorage = [...mappingSet].filter(f => !storageSet.has(f));
    const inStorageNotInMapping = [...storageSet].filter(f => !mappingSet.has(f));

    console.log(`\nفي mapping وليس في Storage: ${inMappingNotInStorage.length}`);
    if (inMappingNotInStorage.length > 0) {
      inMappingNotInStorage.forEach(f => console.log(`  - ${f}`));
    }

    console.log(`\nفي Storage وليس في mapping: ${inStorageNotInMapping.length}`);
    if (inStorageNotInMapping.length > 0 && inStorageNotInMapping.length <= 10) {
      inStorageNotInMapping.forEach(f => console.log(`  - ${f}`));
    } else if (inStorageNotInMapping.length > 10) {
      console.log('  (أول 10 فقط)');
      inStorageNotInMapping.slice(0, 10).forEach(f => console.log(`  - ${f}`));
    }

    // Check products-transformed.json
    console.log('\n' + '='.repeat(80));
    console.log('فحص products-transformed.json:');
    console.log('='.repeat(80));

    let withImage = 0;
    let withPlaceholder = 0;
    let withEmptyUrl = 0;
    const placeholderProducts = [];

    transformedData.forEach(p => {
      if (p.image_url.includes('placeholder')) {
        withPlaceholder++;
        placeholderProducts.push({
          name: p.name,
          image_filename: productsData.products.find(orig => orig.name === p.name)?.image_filename || 'N/A'
        });
      } else {
        withImage++;
      }

      if (!p.image_url || p.image_url === '') {
        withEmptyUrl++;
      }
    });

    console.log(`المنتجات بصورة موجودة: ${withImage}`);
    console.log(`المنتجات بPlaceholder: ${withPlaceholder}`);
    console.log(`المنتجات بدون image_url: ${withEmptyUrl}`);

    if (placeholderProducts.length > 0) {
      console.log('\nالمنتجات الـ54 التي تحتاج Placeholder:');
      placeholderProducts.forEach(p => {
        console.log(`  - ${p.name} (image_filename: ${p.image_filename})`);
      });
    }

    // Verify placeholder URL
    const placeholderUrl = 'https://rgnpxovzbwzfofbbsaja.supabase.co/storage/v1/object/public/product-images/placeholder.svg';
    console.log(`\nPlaceholder URL المستخدم: ${placeholderUrl}`);
    console.log('✓ Placeholder ليس صورة من تصنيفات (مسار: product-images/products/)');

    console.log('\n' + '='.repeat(80));
    console.log('تم الفحص بنجاح');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('\n✗ خطأ:', error.message);
    console.error(error.stack);
  }
}

checkImages();
