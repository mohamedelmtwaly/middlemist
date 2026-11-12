const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTotalProducts() {
  console.log('=== CHECKING TOTAL PRODUCTS COUNT ===\n');

  const { count, error } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: false });

  if (error) {
    console.error('❌ Error:', error);
  } else {
    console.log(`Total products in database: ${count}`);
  }

  // Check by category
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name_ar');

  if (categories) {
    console.log('\nProducts by category:');
    for (const cat of categories) {
      const { count: catCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: false })
        .eq('category_id', cat.id);

      console.log(`   ${cat.name_ar}: ${catCount || 0} products`);
    }
  }
}

checkTotalProducts();
