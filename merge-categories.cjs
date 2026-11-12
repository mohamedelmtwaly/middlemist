const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function mergeCategories() {
  console.log('🔄 Merging "باقات المناسبات" into "باقات الورد"...\n');

  try {
    // Step 1: Find both categories
    console.log('🔍 Finding categories...');
    const { data: categories, error: findError } = await supabase
      .from('categories')
      .select('*')
      .in('name_ar', ['باقات الورد', 'باقات المناسبات']);

    if (findError) {
      throw findError;
    }

    const oldCategory = categories.find(c => c.name_ar === 'باقات المناسبات');
    const newCategory = categories.find(c => c.name_ar === 'باقات الورد');

    if (!oldCategory) {
      console.error('❌ Category "باقات المناسبات" not found');
      process.exit(1);
    }

    if (!newCategory) {
      console.error('❌ Category "باقات الورد" not found');
      process.exit(1);
    }

    console.log(`✅ Found "باقات المناسبات" (ID: ${oldCategory.id})`);
    console.log(`✅ Found "باقات الورد" (ID: ${newCategory.id})\n`);

    // Step 2: Update all products from old category to new category
    console.log('📦 Updating products from "باقات المناسبات" to "باقات الورد"...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, category, category_id')
      .eq('category', 'باقات المناسبات');

    if (productsError) {
      throw productsError;
    }

    console.log(`Found ${products.length} products with category "باقات المناسبات"\n`);

    if (products.length > 0) {
      const { error: updateProductsError } = await supabase
        .from('products')
        .update({
          category: 'باقات الورد',
          category_id: newCategory.id
        })
        .eq('category', 'باقات المناسبات');

      if (updateProductsError) {
        throw updateProductsError;
      }

      console.log(`✅ Updated ${products.length} products\n`);
    }

    // Step 3: Delete the old category
    console.log('🗑️  Deleting old category "باقات المناسبات"...');
    const { error: deleteError } = await supabase
      .from('categories')
      .delete()
      .eq('id', oldCategory.id);

    if (deleteError) {
      throw deleteError;
    }

    console.log(`✅ Deleted category "باقات المناسبات"\n`);

    console.log('🎉 Category merge completed successfully!');
    console.log(`\nOld category: باقات المناسبات (ID: ${oldCategory.id}) - DELETED`);
    console.log(`New category: باقات الورد (ID: ${newCategory.id}) - ACTIVE`);
    console.log(`Products updated: ${products.length}`);

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

mergeCategories();
