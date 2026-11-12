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

// Category ID for الفازات
const CATEGORY_ID = '00bb1aa6-49a6-4a38-b83e-5223046274ad';
const CATEGORY_NAME = 'الفازات';

async function verifyProducts() {
  console.log('🔍 Verifying vase products...\n');

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

    console.log(`✅ Found ${products.length} products in category "${CATEGORY_NAME}"\n`);

    // Verify each product
    let errors = [];
    let warnings = [];

    products.forEach((product, index) => {
      const num = index + 1;

      // Check required fields
      if (!product.name) {
        errors.push(`#${num}: Missing name`);
      }
      if (!product.category) {
        errors.push(`#${num}: Missing category`);
      }
      if (product.category !== CATEGORY_NAME) {
        errors.push(`#${num}: Wrong category "${product.category}" (expected "${CATEGORY_NAME}")`);
      }
      if (product.category_id !== CATEGORY_ID) {
        errors.push(`#${num}: Wrong category_id "${product.category_id}" (expected "${CATEGORY_ID}")`);
      }
      if (!product.price || product.price <= 0) {
        errors.push(`#${num}: Invalid price ${product.price}`);
      }
      if (!product.image_url) {
        errors.push(`#${num}: Missing image_url`);
      }
      if (!product.image_url.includes('products/vases/')) {
        warnings.push(`#${num}: Image URL may be incorrect: ${product.image_url}`);
      }
      if (!product.description) {
        warnings.push(`#${num}: Missing description`);
      }
      if (product.is_active !== true) {
        errors.push(`#${num}: Product is not active`);
      }
    });

    // Print results
    if (errors.length === 0 && warnings.length === 0) {
      console.log('✅ All products verified successfully!\n');
    } else {
      if (errors.length > 0) {
        console.log(`❌ Errors (${errors.length}):`);
        errors.forEach(err => console.log(`  - ${err}`));
        console.log('');
      }
      if (warnings.length > 0) {
        console.log(`⚠️  Warnings (${warnings.length}):`);
        warnings.forEach(warn => console.log(`  - ${warn}`));
        console.log('');
      }
    }

    // Print sample products
    console.log('📋 Sample products (first 5):');
    products.slice(0, 5).forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.name}`);
      console.log(`   Price: ${product.price} SAR`);
      console.log(`   Category: ${product.category}`);
      console.log(`   Image: ${product.image_url}`);
    });

    console.log(`\n📊 Total products: ${products.length}`);
    console.log(`📁 Category: ${CATEGORY_NAME} (ID: ${CATEGORY_ID})`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

verifyProducts();
