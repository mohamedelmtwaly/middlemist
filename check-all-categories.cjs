const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAllCategories() {
  console.log('=== CHECKING ALL PRODUCT CATEGORY VALUES ===\n');

  const { data: products } = await supabase
    .from('products')
    .select('id, name, category, category_id')
    .limit(20);

  if (products) {
    const categoryCounts = {};
    products.forEach(p => {
      if (!categoryCounts[p.category]) {
        categoryCounts[p.category] = 0;
      }
      categoryCounts[p.category]++;
    });

    console.log('Category values in products:');
    Object.entries(categoryCounts).forEach(([cat, count]) => {
      console.log(`   "${cat}": ${count} products`);
    });

    console.log('\nSample products:');
    products.slice(0, 10).forEach(p => {
      console.log(`   ${p.name}: category="${p.category}"`);
    });
  }
}

checkAllCategories();
