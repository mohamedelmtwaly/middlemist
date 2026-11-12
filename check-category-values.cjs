const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCategoryValues() {
  console.log('=== CHECKING CATEGORY VALUES IN PRODUCTS ===\n');

  // Check الفازات
  console.log('1. Checking الفازات products...');
  const { data: vases } = await supabase
    .from('products')
    .select('id, name, category, category_id')
    .eq('category_id', '00bb1aa6-49a6-4a38-b83e-5223046274ad')
    .limit(5);

  if (vases && vases.length > 0) {
    console.log('Sample الفازات products:');
    vases.forEach(p => {
      console.log(`   ${p.name}: category="${p.category}"`);
    });
  }

  // Check الأستاندات
  console.log('\n2. Checking الأستاندات products...');
  const { data: stands } = await supabase
    .from('products')
    .select('id, name, category, category_id')
    .eq('category_id', '04c3fa1e-7f19-499e-b401-4a1ae3fb2e1d')
    .limit(5);

  if (stands && stands.length > 0) {
    console.log('Sample الأستاندات products:');
    stands.forEach(p => {
      console.log(`   ${p.name}: category="${p.category}"`);
    });
  }

  // Check categories table
  console.log('\n3. Checking categories table...');
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name_ar')
    .in('id', ['00bb1aa6-49a6-4a38-b83e-5223046274ad', '04c3fa1e-7f19-499e-b401-4a1ae3fb2e1d']);

  if (categories) {
    categories.forEach(c => {
      console.log(`   ${c.id}: name_ar="${c.name_ar}"`);
    });
  }
}

checkCategoryValues();
