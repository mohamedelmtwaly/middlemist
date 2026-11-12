const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

console.log('='.repeat(80));
console.log('فحص الحماية قبل الحذف (READ ONLY)');
console.log('='.repeat(80));

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
const supabase = createClient(supabaseUrl, supabaseSecretKey);

async function preDeleteCheck() {
  try {
    // Step 1: Check current products count
    console.log('\n[1] فحص عدد المنتجات الحالي...');
    const { count: productsCount, error: productsError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (productsError) {
      console.error('✗ خطأ في فحص المنتجات:', productsError.message);
      return;
    }
    console.log(`✓ عدد المنتجات الحالي: ${productsCount}`);

    if (productsCount !== 181) {
      console.log(`⚠ تحذير: العدد المتوقع 181 لكنه ${productsCount}`);
    }

    // Step 2: Check cart_items
    console.log('\n[2] فحص cart_items...');
    const { count: cartCount, error: cartError } = await supabase
      .from('cart_items')
      .select('*', { count: 'exact', head: true });

    if (cartError) {
      console.error('✗ خطأ في فحص cart_items:', cartError.message);
      return;
    }
    console.log(`✓ عدد السجلات في cart_items: ${cartCount}`);

    if (cartCount > 0) {
      console.log('⚠ تحذير: يوجد سجلات في cart_items - قد يكون هناك علاقات!');
      // Get the product_ids to check
      const { data: cartData } = await supabase
        .from('cart_items')
        .select('product_id')
        .limit(10);
      console.log('  عينة من product_ids:', cartData?.map(c => c.product_id));
    }

    // Step 3: Check order_items
    console.log('\n[3] فحص order_items...');
    const { count: orderCount, error: orderError } = await supabase
      .from('order_items')
      .select('*', { count: 'exact', head: true });

    if (orderError) {
      console.error('✗ خطأ في فحص order_items:', orderError.message);
      return;
    }
    console.log(`✓ عدد السجلات في order_items: ${orderCount}`);

    if (orderCount > 0) {
      console.log('⚠ تحذير: يوجد سجلات في order_items - قد يكون هناك علاقات!');
      const { data: orderData } = await supabase
        .from('order_items')
        .select('product_id')
        .limit(10);
      console.log('  عينة من product_ids:', orderData?.map(o => o.product_id));
    }

    // Step 4: Check favorites
    console.log('\n[4] فحص favorites...');
    const { count: favCount, error: favError } = await supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true });

    if (favError) {
      console.error('✗ خطأ في فحص favorites:', favError.message);
      return;
    }
    console.log(`✓ عدد السجلات في favorites: ${favCount}`);

    if (favCount > 0) {
      console.log('⚠ تحذير: يوجد سجلات في favorites - قد يكون هناك علاقات!');
      const { data: favData } = await supabase
        .from('favorites')
        .select('product_id')
        .limit(10);
      console.log('  عينة من product_ids:', favData?.map(f => f.product_id));
    }

    // Step 5: Get all current products for backup
    console.log('\n[5] جلب جميع المنتجات الحالية للنسخ الاحتياطي...');
    const { data: allProducts, error: fetchError } = await supabase
      .from('products')
      .select('*');

    if (fetchError) {
      console.error('✗ خطأ في جلب المنتجات:', fetchError.message);
      return;
    }
    console.log(`✓ تم جلب ${allProducts.length} منتج`);

    // Step 6: Save backup
    const backupPath = path.join(__dirname, `products-backup-${new Date().toISOString().split('T')[0]}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(allProducts, null, 2), 'utf8');
    console.log(`✓ تم حفظ النسخة الاحتياطية: ${backupPath}`);

    // Verify backup can be read
    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    console.log(`✓ تم التحقق من قراءة النسخة الاحتياطية: ${backupData.length} منتج`);

    // Step 7: Check categories
    console.log('\n[7] فحص التصنيفات الحالية...');
    const { data: categories } = await supabase
      .from('categories')
      .select('*');
    console.log(`✓ عدد التصنيفات: ${categories.length}`);

    // Display categories with IDs
    console.log('\n التصنيفات الحالية:');
    categories.forEach(cat => {
      console.log(`  - ${cat.name_ar} (ID: ${cat.id})`);
    });

    // Final safety check
    console.log('\n' + '='.repeat(80));
    console.log('نتيجة الفحص الأمني:');
    console.log('='.repeat(80));
    console.log(`المنتجات الحالية: ${productsCount}`);
    console.log(`cart_items: ${cartCount} سجل`);
    console.log(`order_items: ${orderCount} سجل`);
    console.log(`favorites: ${favCount} سجل`);
    console.log(`النسخة الاحتياطية: ${backupPath}`);
    console.log('='.repeat(80));

    if (cartCount > 0 || orderCount > 0 || favCount > 0) {
      console.log('\n⚠ إيقاف: يوجد سجلات مرتبطة بالمنتجات!');
      console.log('يرجى مراجعة العلاقات قبل المتابعة.');
      return false;
    }

    console.log('\n✓ الفحص الأمني ناجح - يمكن المتابعة');
    return true;

  } catch (error) {
    console.error('\n✗ خطأ:', error.message);
    console.error(error.stack);
    return false;
  }
}

preDeleteCheck();
