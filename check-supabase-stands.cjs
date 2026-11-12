const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const CATEGORY_ID = '04c3fa1e-7f19-499e-b401-4a1ae3fb2e1d';
const CATEGORY_NAME = 'الأستاندات';

async function checkSupabase() {
  console.log('=== CHECKING SUPABASE ===\n');

  // Check category
  console.log('1. Checking category...');
  const { data: category, error: catError } = await supabase
    .from('categories')
    .select('*')
    .eq('id', CATEGORY_ID)
    .single();

  if (catError) {
    console.error('❌ Error fetching category:', catError);
  } else {
    console.log('✅ Category found:');
    console.log(`   ID: ${category.id}`);
    console.log(`   Name (AR): ${category.name_ar}`);
    console.log(`   Name (EN): ${category.name_en}`);
  }

  // Check existing products in category
  console.log('\n2. Checking existing products in category...');
  const { data: products, error: prodError } = await supabase
    .from('products')
    .select('id, name, category, category_id, image_url')
    .eq('category_id', CATEGORY_ID);

  if (prodError) {
    console.error('❌ Error fetching products:', prodError);
  } else {
    console.log(`✅ Found ${products.length} existing products in category`);
    if (products.length > 0) {
      products.slice(0, 5).forEach((p, i) => {
        console.log(`   ${i+1}. ${p.name} (${p.category})`);
      });
      if (products.length > 5) {
        console.log(`   ... and ${products.length - 5} more`);
      }
    }
  }

  // Check storage bucket (we can't directly list files, but we can check if bucket exists)
  console.log('\n3. Storage info:');
  console.log(`   Bucket: product-images`);
  console.log(`   Target path: products/flower-stands/`);
  console.log(`   Note: Cannot directly list files via API without RLS changes`);
}

checkSupabase();
