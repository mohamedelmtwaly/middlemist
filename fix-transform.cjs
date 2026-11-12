const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

console.log('='.repeat(80));
console.log('إصلاح تحويل البيانات - إضافة Placeholder للصور المفقودة');
console.log('='.repeat(80));

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
const supabase = createClient(supabaseUrl, supabaseSecretKey);

// Category mapping
const categoryMapping = {
  'مسكة عروس': '57d70a1f-20b8-4dbf-800c-6ea29de5a778',
  'باقات وهدايا التخرج': '44ab4768-8ab8-49a2-964e-2779d3860a24',
  'استاندات': '04c3fa1e-7f19-499e-b401-4a1ae3fb2e1d',
  'شرايط': '91d11ac7-df3e-4aff-a689-e043a615372c',
  'سلات ورد': '1972b3d0-405e-47ae-960c-1eb858279d42',
  'بوكسات': 'ebc12058-3f22-4a0c-bbe6-1e1b51219685',
  'فازات': '00bb1aa6-49a6-4a38-b83e-5223046274ad',
  'دباديب': '7e0404c0-0259-4548-9dc7-504687b2ff22',
  'بالونات': '3edcc1e9-2221-41ec-bb8a-c6a62021fb82',
  'باقات': '8260dfef-f052-4db4-a084-d9a30ebbcb38',
  'Rose Bouquet': '8260dfef-f052-4db4-a084-d9a30ebbcb38',
  'Helium Bouquets': '3edcc1e9-2221-41ec-bb8a-c6a62021fb82'
};

// Placeholder URL for missing images
const placeholderUrl = 'https://rgnpxovzbwzfofbbsaja.supabase.co/storage/v1/object/public/product-images/placeholder.svg';

async function fixTransform() {
  try {
    // Get storage files
    console.log('\n[1] جلب الصور الموجودة في Storage...');
    const { data: storageFiles } = await supabase
      .storage
      .from('product-images')
      .list('products', { limit: 1000 });

    const storageFileNames = new Set(storageFiles.map(f => f.name));
    console.log(`✓ تم العثور على ${storageFiles.length} صورة`);

    // Load original products
    console.log('\n[2] تحميل المنتجات الأصلية...');
    const productsPath = path.join(__dirname, 'middlemist-products.json');
    const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
    console.log(`✓ تم تحميل ${productsData.products.length} منتج`);

    // Transform products
    console.log('\n[3] تحويل البيانات مع التحقق من الصور...');
    let placeholderCount = 0;
    const transformedProducts = productsData.products.map((p, index) => {
      const categoryId = categoryMapping[p.source_section];
      const imageFilename = p.image_filename.replace(/^products\//, '');
      const imageExists = storageFileNames.has(imageFilename);

      if (!imageExists) {
        placeholderCount++;
      }

      return {
        name: p.name,
        category: p.source_section,
        price: p.price,
        image_url: imageExists ? p.image_url : placeholderUrl,
        description: { ar: p.description || '', en: '' },
        is_active: true,
        sort_order: index + 1,
        category_id: categoryId || null,
        legacy_id: null,
        is_featured: false,
        occasions: null,
        display_sections: null,
        subcategory_id: null
      };
    });

    console.log(`✓ تم تحويل ${transformedProducts.length} منتج`);
    console.log(`✓ تم استخدام Placeholder لـ ${placeholderCount} منتج`);

    // Save transformed data
    const transformedPath = path.join(__dirname, 'products-transformed.json');
    fs.writeFileSync(transformedPath, JSON.stringify(transformedProducts, null, 2), 'utf8');
    console.log(`✓ تم حفظ البيانات المحولة: ${transformedPath}`);

    // Verify
    console.log('\n[4] التحقق من البيانات المحولة...');
    const verifyData = JSON.parse(fs.readFileSync(transformedPath, 'utf8'));
    const actualPlaceholderCount = verifyData.filter(p => p.image_url.includes('placeholder')).length;
    console.log(`✓ التحقق: ${actualPlaceholderCount} منتج بPlaceholder`);

    console.log('\n' + '='.repeat(80));
    console.log('تم إصلاح التحويل بنجاح!');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('\n✗ خطأ:', error.message);
    console.error(error.stack);
  }
}

fixTransform();
