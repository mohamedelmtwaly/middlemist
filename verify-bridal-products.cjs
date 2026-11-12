const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const CATEGORY_ID = '57d70a1f-20b8-4dbf-800c-6ea29de5a778';
const CATEGORY_NAME = 'مسكات العروس';

async function verifyProducts() {
  console.log('🔍 Verifying bridal products in database...\n');

  try {
    // Get products by category_id
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('category_id', CATEGORY_ID)
      .order('sort_order', { ascending: false });

    if (error) {
      throw error;
    }

    console.log(`📦 Found ${products.length} products in category: ${CATEGORY_NAME}\n`);

    if (products.length === 0) {
      console.log('⚠️  No products found in this category');
      return;
    }

    // Display each product
    products.forEach((product, index) => {
      console.log(`--- Product ${index + 1} ---`);
      console.log(`ID: ${product.id}`);
      console.log(`Name: ${product.name}`);
      console.log(`Price: ${product.price} SAR`);
      console.log(`Category: ${product.category}`);
      console.log(`Category ID: ${product.category_id}`);
      console.log(`Description: ${product.description}`);
      console.log(`Image URL: ${product.image_url}`);
      console.log(`Is Active: ${product.is_active}`);
      console.log(`Sort Order: ${product.sort_order}`);
      console.log('');
    });

    // Verify category exists
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('*')
      .eq('id', CATEGORY_ID)
      .single();

    if (categoryError) {
      console.error('❌ Error fetching category:', categoryError);
    } else {
      console.log('--- Category Info ---');
      console.log(`ID: ${category.id}`);
      console.log(`Name: ${category.name_ar}`);
      console.log(`Image URL: ${category.image_url}`);
      console.log(`Is Active: ${category.is_active}`);
      console.log('');
    }

    console.log('✅ Verification complete!');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

verifyProducts();
