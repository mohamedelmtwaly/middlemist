const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

console.log('='.repeat(80));
console.log('تحليل ملف middlemist-products.json (READ ONLY)');
console.log('='.repeat(80));

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
const supabase = createClient(supabaseUrl, supabaseSecretKey);

const productsPath = path.join(__dirname, 'middlemist-products.json');
const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

console.log(`\n✓ تم تحميل ملف المنتجات: ${productsData.products.length} منتج`);

async function analyzeNewProducts() {
  try {
    // Get all storage files
    console.log('\nجاري فحص الصور في Supabase Storage...');
    const { data: storageFiles } = await supabase
      .storage
      .from('product-images')
      .list('products', { limit: 1000 });

    const storageFileNames = new Set(storageFiles.map(f => f.name));
    console.log(`✓ تم العثور على ${storageFiles.length} صورة في products/`);

    // Get current categories
    const { data: categories } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    console.log(`✓ تم العثور على ${categories.length} تصنيف في قاعدة البيانات`);

    // Get current products
    const { data: currentProducts } = await supabase
      .from('products')
      .select('id, name, category, category_id, price');

    console.log(`✓ تم العثور على ${currentProducts.length} منتج حالي`);

    // Initialize stats
    let stats = {
      total: productsData.products.length,
      with_price: 0,
      without_price: 0,
      with_description: 0,
      without_description: 0,
      duplicates: 0,
      unique_names: new Set(),
      sections: {},
      images_verified: 0,
      images_missing: 0,
      images_needs_verification: 0
    };

    // Analyze each product
    let productsWithAnalysis = [];
    for (let p of productsData.products) {
      let hasPrice = p.price !== null && p.price !== undefined;
      let hasDescription = p.description && p.description.trim() !== '';
      let imageExists = storageFileNames.has(p.image_filename);
      let isDuplicate = p.duplicate_name;

      if (hasPrice) stats.with_price++;
      else stats.without_price++;

      if (hasDescription) stats.with_description++;
      else stats.without_description++;

      if (isDuplicate) stats.duplicates++;
      stats.unique_names.add(p.name);

      if (!stats.sections[p.source_section]) {
        stats.sections[p.source_section] = 0;
      }
      stats.sections[p.source_section]++;

      if (imageExists) stats.images_verified++;
      else stats.images_missing++;
      if (p.image_verification === 'pending_per_file') stats.images_needs_verification++;

      productsWithAnalysis.push({
        ...p,
        has_price: hasPrice,
        has_description: hasDescription,
        image_exists: imageExists,
        is_duplicate: isDuplicate
      });
    }

    // Convert unique_names from Set to number
    let uniqueNamesCount = stats.unique_names.size;

    // Extract unique source sections
    let uniqueSections = Object.keys(stats.sections);
    console.log(`\nالأقسام الموجودة في JSON (${uniqueSections.length}):`);
    uniqueSections.forEach(section => {
      console.log(`  - ${section}: ${stats.sections[section]} منتج`);
    });

    // Match sections with existing categories
    console.log('\nمطابقة الأقسام مع التصنيفات الحالية:');
    let sectionMapping = {};
    uniqueSections.forEach(section => {
      let matchingCategory = categories.find(c => c.name_ar.includes(section) || section.includes(c.name_ar));
      if (matchingCategory) {
        sectionMapping[section] = matchingCategory;
        console.log(`  ✓ "${section}" → "${matchingCategory.name_ar}" (ID: ${matchingCategory.id})`);
      } else {
        console.log(`  ✗ "${section}" → لا يوجد تصنيف مطابق`);
      }
    });

    // Save detailed analysis
    let analysis = {
      summary: {
        total_products: stats.total,
        unique_names: uniqueNamesCount,
        duplicates: stats.duplicates,
        with_price: stats.with_price,
        without_price: stats.without_price,
        with_description: stats.with_description,
        without_description: stats.without_description,
        images_verified: stats.images_verified,
        images_missing: stats.images_missing,
        images_needs_verification: stats.images_needs_verification,
        unique_sections: uniqueSections.length,
        current_products: currentProducts.length,
        current_categories: categories.length
      },
      sections_distribution: stats.sections,
      section_category_mapping: sectionMapping,
      products: productsWithAnalysis
    };

    let analysisPath = path.join(__dirname, 'new-products-analysis.json');
    fs.writeFileSync(analysisPath, JSON.stringify(analysis, null, 2), 'utf8');
    console.log(`\n✓ تم حفظ التحليل: ${analysisPath}`);

    // Save summary
    let summaryPath = path.join(__dirname, 'new-products-summary.txt');
    let summary = `
ملخص تحليل المنتجات الجديدة (middlemist-products.json)
================================================================================

إحصائيات المنتجات:
-----------------------
إجمالي المنتجات في JSON: ${stats.total}
الأسماء الفريدة: ${uniqueNamesCount}
المنتجات المكررة: ${stats.duplicates}

الأسعار:
---------
المنتجات بسعر: ${stats.with_price}
المنتجات بدون سعر: ${stats.without_price}

الأوصاف:
---------
المنتجات بوصف: ${stats.with_description}
المنتجات بدون وصف: ${stats.without_description}

الصور:
-------
الصور الموجودة في Storage: ${stats.images_verified}
الصور المفقودة في Storage: ${stats.images_missing}
الصور تحتاج تحقق: ${stats.images_needs_verification}

الأقسام:
---------
عدد الأقسام الفريدة: ${uniqueSections.length}
`;
    Object.entries(stats.sections).forEach(([section, count]) => {
      summary += `  ${section}: ${count} منتج\n`;
    });

    summary += `
مطابقة الأقسام مع التصنيفات:
----------------------------------
`;
    Object.entries(sectionMapping).forEach(([section, cat]) => {
      summary += `  "${section}" → "${cat.name_ar}" (ID: ${cat.id})\n`;
    });

    let unmappedSections = uniqueSections.filter(s => !sectionMapping[s]);
    if (unmappedSections.length > 0) {
      summary += `\nالأقسام بدون تصنيف مطابق:\n`;
      unmappedSections.forEach(s => {
        summary += `  - ${s}\n`;
      });
    }

    summary += `
الحالة الحالية:
----------------
المنتجات الحالية في DB: ${currentProducts.length}
التصنيفات الحالية في DB: ${categories.length}

الملفات المحفوظة:
----------------
- new-products-analysis.json (التحليل الكامل)
- new-products-summary.txt (هذا الملف)
`;
    fs.writeFileSync(summaryPath, summary, 'utf8');
    console.log(`✓ تم حفظ الملخص: ${summaryPath}`);

    console.log('\n' + '='.repeat(80));
    console.log('الملخص:');
    console.log('='.repeat(80));
    console.log(`إجمالي المنتجات الجديدة: ${stats.total}`);
    console.log(`الأسماء الفريدة: ${uniqueNamesCount}`);
    console.log(`المنتجات المكررة: ${stats.duplicates}`);
    console.log(`الصور الموجودة: ${stats.images_verified}`);
    console.log(`الصور المفقودة: ${stats.images_missing}`);
    console.log(`الأقسام الفريدة: ${uniqueSections.length}`);
    console.log(`الأقسام المطابقة: ${Object.keys(sectionMapping).length}`);
    console.log(`الأقسام غير المطابقة: ${unmappedSections.length}`);
    console.log('='.repeat(80));

  } catch (error) {
    console.error('\n✗ خطأ:', error.message);
    console.error(error.stack);
  }
}

analyzeNewProducts();
