const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const CATEGORY_ID = '91d11ac7-df3e-4aff-a689-e043a615372c';
const CATEGORY_NAME = 'الطباعة والإضافات';

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

  // Check if any of the target products already exist
  console.log('\n3. Checking if target products already exist...');
  const targetNames = [
    'طباعات اكرلك على حسب الطلب',
    'طباعه',
    'ثيم العيد',
    'اكرليك',
    'طباعه ملونه وعادي',
    'طباعه أكواب',
    'اكرليك ذهبي 3 ملي',
    'طباعه اكرليك',
    'تغرسه اكرليك',
    'طباعه استيكر',
    'شرايط مطبوعه'
  ];

  const { data: existingTargetProducts } = await supabase
    .from('products')
    .select('id, name, category, category_id')
    .in('name', targetNames);

  if (existingTargetProducts && existingTargetProducts.length > 0) {
    console.log(`⚠️  Found ${existingTargetProducts.length} target products already in database:`);
    existingTargetProducts.forEach(p => {
      console.log(`   - ${p.name} (category: ${p.category}, category_id: ${p.category_id})`);
    });
  } else {
    console.log('✅ None of the target products exist in database');
  }

  // Storage info
  console.log('\n4. Storage info:');
  console.log(`   Bucket: product-images`);
  console.log(`   Target path: products/printing-addons/`);
  console.log(`   Note: Cannot directly list files via API without RLS changes`);
}

checkSupabase();
