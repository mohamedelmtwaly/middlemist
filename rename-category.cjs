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

async function renameCategory() {
  console.log('🔄 Renaming category "باقة المناسبات" to "باقة الورد"...\n');

  try {
    // Step 1: Find the category
    console.log('🔍 Finding category "باقة المناسبات"...');
    const { data: category, error: findError } = await supabase
      .from('categories')
      .select('*')
      .eq('name_ar', 'باقة المناسبات')
      .single();

    if (findError) {
      throw findError;
    }

    if (!category) {
      console.error('❌ Category "باقة المناسبات" not found');
      process.exit(1);
    }

    console.log(`✅ Found category: ${category.name_ar} (ID: ${category.id})\n`);

    // Step 2: Update the category name
    console.log('📝 Updating category name to "باقة الورد"...');
    const { data: updatedCategory, error: updateError } = await supabase
      .from('categories')
      .update({ name_ar: 'باقة الورد' })
      .eq('id', category.id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    console.log(`✅ Category updated successfully\n`);

    // Step 3: Update all products with this category
    console.log('📦 Updating products with this category...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, category')
      .eq('category', 'باقة المناسبات');

    if (productsError) {
      throw productsError;
    }

    console.log(`Found ${products.length} products with category "باقة المناسبات"\n`);

    if (products.length > 0) {
      const { error: updateProductsError } = await supabase
        .from('products')
        .update({ category: 'باقة الورد' })
        .eq('category', 'باقة المناسبات');

      if (updateProductsError) {
        throw updateProductsError;
      }

      console.log(`✅ Updated ${products.length} products\n`);
    }

    console.log('🎉 Category rename completed successfully!');
    console.log(`\nOld name: باقة المناسبات`);
    console.log(`New name: باقة الورد`);
    console.log(`Category ID: ${category.id}`);
    console.log(`Products updated: ${products.length}`);

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

renameCategory();
