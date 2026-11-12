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

// Category ID for البالونات
const CATEGORY_ID = '3edcc1e9-2221-41ec-bb8a-c6a62021fb82';
const CATEGORY_NAME = 'البالونات';

async function verifyBalloons() {
  console.log('🔍 Verifying balloon products...\n');

  try {
    // Get all products in the category
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('category_id', CATEGORY_ID)
      .order('sort_order', { ascending: true });

    if (error) {
      throw error;
    }

    console.log(`📦 Total products in category: ${products.length}\n`);

    // Check each product
    let validCount = 0;
    let missingImageCount = 0;
    let invalidCategoryCount = 0;

    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   ID: ${product.id}`);
      console.log(`   Price: ${product.price} SAR`);
      console.log(`   Category: ${product.category}`);
      console.log(`   Image URL: ${product.image_url}`);
      console.log(`   Active: ${product.is_active}`);
      console.log(`   Sort Order: ${product.sort_order}`);

      // Check if image URL is valid
      if (product.image_url && product.image_url.includes('product-images')) {
        validCount++;
      } else {
        missingImageCount++;
        console.log('   ⚠️  MISSING OR INVALID IMAGE');
      }

      // Check category name
      if (product.category !== CATEGORY_NAME) {
        invalidCategoryCount++;
        console.log(`   ⚠️  CATEGORY MISMATCH: Expected "${CATEGORY_NAME}", got "${product.category}"`);
      }

      console.log('');
    });

    console.log('--- SUMMARY ---');
    console.log(`✅ Valid products with images: ${validCount}`);
    console.log(`⚠️  Products with missing/invalid images: ${missingImageCount}`);
    console.log(`⚠️  Products with category mismatch: ${invalidCategoryCount}`);
    console.log(`📦 Total products: ${products.length}`);

    if (validCount === products.length && invalidCategoryCount === 0) {
      console.log('\n🎉 All products verified successfully!');
    } else {
      console.log('\n⚠️  Some issues detected. Please review the logs above.');
    }

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

verifyBalloons();
