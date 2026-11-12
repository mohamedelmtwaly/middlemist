const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

console.log('='.repeat(80));
console.log('تحليل هيكل قاعدة البيانات (READ ONLY)');
console.log('='.repeat(80));

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
const supabase = createClient(supabaseUrl, supabaseSecretKey);

async function analyzeSchema() {
  try {
    // Get products table structure
    console.log('\nجاري فحص جدول products...');
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .limit(1);

    if (error) {
      console.error('✗ خطأ في جلب products:', error.message);
      return;
    }

    if (products && products.length > 0) {
      console.log('✓ الحقول الموجودة في جدول products:');
      Object.keys(products[0]).forEach(key => {
        console.log(`  - ${key}: ${typeof products[0][key]}`);
      });
    }

    // Get categories table structure
    console.log('\nجاري فحص جدول categories...');
    const { data: categories } = await supabase
      .from('categories')
      .select('*')
      .limit(1);

    if (categories && categories.length > 0) {
      console.log('✓ الحقول الموجودة في جدول categories:');
      Object.keys(categories[0]).forEach(key => {
        console.log(`  - ${key}: ${typeof categories[0][key]}`);
      });
    }

    // Check for related tables
    console.log('\nجاري فحص الجداول المرتبطة...');

    // Check cart_items
    try {
      const { data: cartItems } = await supabase
        .from('cart_items')
        .select('product_id')
        .limit(1);
      console.log('✓ جدول cart_items موجود (يحتوي على product_id)');
    } catch (e) {
      console.log('✗ جدول cart_items غير موجود أو غير قابل للوصول');
    }

    // Check order_items
    try {
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('product_id')
        .limit(1);
      console.log('✓ جدول order_items موجود (يحتوي على product_id)');
    } catch (e) {
      console.log('✗ جدول order_items غير موجود أو غير قابل للوصول');
    }

    // Check favorites
    try {
      const { data: favorites } = await supabase
        .from('favorites')
        .select('product_id')
        .limit(1);
      console.log('✓ جدول favorites موجود (يحتوي على product_id)');
    } catch (e) {
      console.log('✗ جدول favorites غير موجود أو غير قابل للوصول');
    }

    // Count records in related tables
    console.log('\nإحصائيات الجداول المرتبطة:');

    try {
      const { count: cartCount } = await supabase
        .from('cart_items')
        .select('*', { count: 'exact', head: true });
      console.log(`  - cart_items: ${cartCount} سجل`);
    } catch (e) {
      console.log('  - cart_items: غير قابل للوصول');
    }

    try {
      const { count: orderCount } = await supabase
        .from('order_items')
        .select('*', { count: 'exact', head: true });
      console.log(`  - order_items: ${orderCount} سجل`);
    } catch (e) {
      console.log('  - order_items: غير قابل للوصول');
    }

    try {
      const { count: favCount } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true });
      console.log(`  - favorites: ${favCount} سجل`);
    } catch (e) {
      console.log('  - favorites: غير قابل للوصول');
    }

    // Save schema analysis
    const schemaAnalysis = {
      products_fields: products && products.length > 0 ? Object.keys(products[0]) : [],
      categories_fields: categories && categories.length > 0 ? Object.keys(categories[0]) : [],
      related_tables: {
        cart_items: true,
        order_items: true,
        favorites: true
      }
    };

    const schemaPath = path.join(__dirname, 'schema-analysis.json');
    fs.writeFileSync(schemaPath, JSON.stringify(schemaAnalysis, null, 2), 'utf8');
    console.log(`\n✓ تم حفظ تحليل الهيكل: ${schemaPath}`);

    console.log('\n' + '='.repeat(80));

  } catch (error) {
    console.error('\n✗ خطأ:', error.message);
    console.error(error.stack);
  }
}

analyzeSchema();
