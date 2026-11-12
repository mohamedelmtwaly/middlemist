const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixCategoryValues() {
  console.log('=== FIXING CATEGORY VALUES IN PRODUCTS ===\n');

  // Get all categories
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name_ar');

  if (!categories) {
    console.error('❌ No categories found');
    return;
  }

  console.log('Updating product category values to match categories.name_ar...\n');

  let totalUpdated = 0;

  for (const cat of categories) {
    console.log(`Processing category: ${cat.name_ar}...`);

    // Update all products in this category
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, category')
      .eq('category_id', cat.id);

    if (error) {
      console.error(`   ❌ Error fetching products: ${error.message}`);
      continue;
    }

    if (!products || products.length === 0) {
      console.log(`   ℹ️  No products found`);
      continue;
    }

    // Filter products that need updating
    const mismatched = products.filter(p => p.category !== cat.name_ar);

    if (mismatched.length === 0) {
      console.log(`   ✅ All products already match`);
      continue;
    }

    console.log(`   Found ${mismatched.length} products to update`);

    // Update each product
    for (const product of mismatched) {
      const { error: updateError } = await supabase
        .from('products')
        .update({ category: cat.name_ar })
        .eq('id', product.id);

      if (updateError) {
        console.error(`      ❌ Failed to update ${product.name}: ${updateError.message}`);
      } else {
        console.log(`      ✅ Updated: ${product.name} "${product.category}" → "${cat.name_ar}"`);
        totalUpdated++;
      }
    }
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`Total products updated: ${totalUpdated}`);
}

fixCategoryValues();
