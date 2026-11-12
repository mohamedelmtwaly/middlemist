const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCategoriesMapping() {
  console.log('=== CHECKING CATEGORIES MAPPING ===\n');

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name_ar')
    .order('sort_order', { ascending: true });

  if (categories) {
    console.log('Categories in database:');
    categories.forEach(c => {
      console.log(`   ${c.id}: name_ar="${c.name_ar}"`);
    });
  }

  console.log('\n=== CHECKING PRODUCT CATEGORY VALUES VS CATEGORY NAMES ===\n');

  for (const cat of categories) {
    const { data: products } = await supabase
      .from('products')
      .select('id, name, category')
      .eq('category_id', cat.id)
      .limit(5);

    if (products && products.length > 0) {
      console.log(`\nCategory: ${cat.name_ar} (ID: ${cat.id})`);
      const mismatched = products.filter(p => p.category !== cat.name_ar);
      if (mismatched.length > 0) {
        console.log(`   ❌ MISMATCHED products (${mismatched.length}):`);
        mismatched.forEach(p => {
          console.log(`      ${p.name}: category="${p.category}" (expected "${cat.name_ar}")`);
        });
      } else {
        console.log(`   ✅ All products match`);
      }
    }
  }
}

checkCategoriesMapping();
