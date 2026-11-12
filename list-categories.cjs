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

async function listCategories() {
  console.log('📋 Listing all categories...\n');

  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      throw error;
    }

    console.log(`Found ${categories.length} categories:\n`);
    categories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.name_ar} (ID: ${cat.id})`);
      if (cat.parent_id) {
        console.log(`   Parent ID: ${cat.parent_id}`);
      }
    });

    // Also check products to see what category names are actually used
    console.log('\n--- Product category distribution ---\n');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('category');

    if (productsError) {
      throw productsError;
    }

    const categoryCounts = {};
    products.forEach(p => {
      if (p.category) {
        categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
      }
    });

    Object.entries(categoryCounts).forEach(([cat, count]) => {
      console.log(`${cat}: ${count} products`);
    });

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

listCategories();
