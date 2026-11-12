const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('='.repeat(80));
console.log('فحص وجود placeholder.svg في Supabase Storage (READ ONLY)');
console.log('='.repeat(80));

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
const supabase = createClient(supabaseUrl, supabaseSecretKey);

async function checkPlaceholder() {
  try {
    // Check if placeholder.svg exists in root of bucket
    console.log('\nجاري فحص جذر Bucket...');
    const { data: rootFiles } = await supabase
      .storage
      .from('product-images')
      .list('', { limit: 1000 });

    const rootFileNames = rootFiles.map(f => f.name);
    console.log(`\nملفات في جذر Bucket: ${rootFileNames.length}`);
    if (rootFileNames.includes('placeholder.svg')) {
      console.log('✓ placeholder.svg موجود في جذر Bucket');
    } else {
      console.log('✗ placeholder.svg غير موجود في جذر Bucket');
    }

    // Check if placeholder.svg exists in products/ folder
    console.log('\nجاري فحص مجلد products/...');
    const { data: productsFiles } = await supabase
      .storage
      .from('product-images')
      .list('products', { limit: 1000 });

    const productsFileNames = productsFiles.map(f => f.name);
    console.log(`\nملفات في products/: ${productsFileNames.length}`);
    if (productsFileNames.includes('placeholder.svg')) {
      console.log('✓ placeholder.svg موجود في products/');
    } else {
      console.log('✗ placeholder.svg غير موجود في products/');
    }

    console.log('\n' + '='.repeat(80));
    console.log('URL المستخدم في products-transformed.json:');
    console.log('https://rgnpxovzbwzfofbbsaja.supabase.co/storage/v1/object/public/product-images/placeholder.svg');
    console.log('\nهذا الرابط يشير إلى: جذر Bucket (product-images/placeholder.svg)');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('\n✗ خطأ:', error.message);
  }
}

checkPlaceholder();
