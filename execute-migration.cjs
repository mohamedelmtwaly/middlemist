const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

console.log('='.repeat(80));
console.log('تنفيذ استبدال الكتالوج داخل Transaction');
console.log('='.repeat(80));

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
const supabase = createClient(supabaseUrl, supabaseSecretKey);

async function executeMigration() {
  try {
    // Step 1: Load transformed products
    console.log('\n[1] تحميل البيانات المحولة...');
    const transformedPath = path.join(__dirname, 'products-transformed.json');
    const transformedData = JSON.parse(fs.readFileSync(transformedPath, 'utf8'));
    console.log(`✓ تم تحميل ${transformedData.length} منتج`);

    // Step 2: Execute the migration using RPC
    console.log('\n[2] تنفيذ استبدال الكتالوج داخل Transaction...');
    console.log('⚠ هذه العملية ستحذف جميع المنتجات الحالية وتستبدلها بالجديدة');

    const { data: result, error: migrationError } = await supabase
      .rpc('replace_products_catalog', { new_products: transformedData });

    if (migrationError) {
      console.error('✗ خطأ في التنفيذ:', migrationError.message);
      if (migrationError.message.includes('function') || migrationError.message.includes('does not exist')) {
        console.error('\n⚠ SQL Function غير موجودة!');
        console.error('يرجى تنفيذ SQL التالي في Supabase SQL Editor أولاً:');
        console.error('='.repeat(80));
        
        const sqlFunction = fs.readFileSync(
          path.join(__dirname, 'migration-function.sql'),
          'utf8'
        );
        console.error(sqlFunction);
        console.error('='.repeat(80));
      }
      console.error('⚠ تم Rollback تلقائي - البيانات لم تتغير');
      return;
    }

    console.log('✓ تم تنفيذ Transaction بنجاح');
    console.log('النتيجة:', result);

    // Step 3: Verify the results
    console.log('\n[3] التحقق من النتائج...');

    const { count: newCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    console.log(`✓ عدد المنتجات بعد الاستيراد: ${newCount}`);

    if (newCount !== 348) {
      console.log(`⚠ تحذير: المتوقع 348 لكن الناتج ${newCount}`);
    }

    // Check category distribution
    const { data: categoryStats } = await supabase
      .from('products')
      .select('category_id, categories!inner(name_ar)')
      .order('category_id');

    const categoryCounts = {};
    categoryStats.forEach(p => {
      const catName = p.categories.name_ar;
      categoryCounts[catName] = (categoryCounts[catName] || 0) + 1;
    });

    console.log('\nتوزيع المنتجات حسب التصنيف:');
    Object.entries(categoryCounts).forEach(([cat, count]) => {
      console.log(`  - ${cat}: ${count} منتج`);
    });

    // Check products with placeholder images
    const { data: placeholderProducts } = await supabase
      .from('products')
      .select('name, image_url')
      .ilike('image_url', '%placeholder%');

    console.log(`\nالمنتجات بPlaceholder: ${placeholderProducts.length}`);

    console.log('\n' + '='.repeat(80));
    console.log('تم استبدال الكتالوج بنجاح!');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('\n✗ خطأ:', error.message);
    console.error(error.stack);
  }
}

executeMigration();
