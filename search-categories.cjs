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

async function searchCategories() {
  console.log('🔍 Searching for categories with "مناسبات" or "باقات"...\n');

  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .or('name_ar.ilike.%مناسبات%,name_ar.ilike.%باقات%')
      .order('sort_order', { ascending: true });

    if (error) {
      throw error;
    }

    console.log(`Found ${categories.length} matching categories:\n`);
    categories.forEach((cat, index) => {
      console.log(`${index + 1}. "${cat.name_ar}" (ID: ${cat.id})`);
      if (cat.parent_id) {
        console.log(`   Parent ID: ${cat.parent_id}`);
      }
    });

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

searchCategories();
